import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { createHash } from 'node:crypto';
import { IsNull } from 'typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import {
  CuentaUsuario,
  EstadoUsuario,
} from '../usuarios/entidades/cuenta-usuario.entity';
import { DatosUsuario } from '../usuarios/entidades/datos-usuario.entity';
import { Sesion } from './entidades/sesion.entity';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { RespuestaInicioSesion } from './dto/respuesta-inicio-sesion.dto';
import { getAccessTokenTtlSeconds } from './jwt.config';

@Injectable()
export class AutenticacionService {
  private readonly logger = new Logger(AutenticacionService.name);

  constructor(
    @InjectRepository(DatosUsuario)
    private readonly datosUsuarioRepository: Repository<DatosUsuario>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async login(
    dto: IniciarSesionDto,
    requestIp: string,
  ): Promise<RespuestaInicioSesion> {
    const matches = await this.datosUsuarioRepository
      .createQueryBuilder('userData')
      .innerJoinAndSelect('userData.cuentaUsuario', 'account')
      .where('LOWER(BTRIM(userData.correo)) = :email', {
        email: dto.email,
      })
      .take(2)
      .getMany();

    if (matches.length !== 1 || !matches[0].cuentaUsuario) {
      if (matches.length > 1) {
        this.logger.error(
          'Login blocked because normalized email matches multiple accounts.',
        );
      }
      throw new UnauthorizedException('Credenciales no válidas.');
    }

    const account = matches[0].cuentaUsuario;
    if (
      account.estado !== EstadoUsuario.ACTIVO ||
      (account.bloqueadoHasta !== null &&
        account.bloqueadoHasta !== undefined &&
        account.bloqueadoHasta.getTime() > Date.now()) ||
      !account.hashContrasena?.startsWith('$argon2id$')
    ) {
      throw new UnauthorizedException('Credenciales no válidas.');
    }

        const passwordMatches = await argon2.verify(
          account.hashContrasena,
          dto.password,
        );
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales no válidas.');
    }

    const now = new Date();
    const accessToken = await this.jwtService.signAsync({
      sub: account.id,
    });
    const expiresIn = getAccessTokenTtlSeconds(this.configService);

    await this.contextoAuditoria.ejecutar(
      account.id,
      requestIp,
      async (manager) => {
        const accountUpdate = await manager
          .getRepository(CuentaUsuario)
          .update(account.id, { ultimoInicioSesion: now });
        if (accountUpdate.affected === 0) {
          throw new InternalServerErrorException(
            'No fue posible actualizar la fecha del último inicio de sesión.',
          );
        }

        const sesiones = manager.getRepository(Sesion);
        const session = sesiones.create({
          cuentaUsuario: account,
          hashToken: createHash('sha256').update(accessToken).digest('hex'),
          ipSolicitud: requestIp,
          expiraEn: new Date(now.getTime() + expiresIn * 1000),
        });
        try {
          await sesiones.save(session);
        } catch (error) {
          if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === '23505'
          ) {
            throw new ConflictException('No fue posible crear la sesión.');
          }
          throw error;
        }
      },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  async logout(
    userId: string,
    sessionId: string,
    requestIp: string,
  ): Promise<void> {
    await this.contextoAuditoria.ejecutar(userId, requestIp, async (manager) => {
      const sessions = manager.getRepository(Sesion);
      const session = await sessions.findOne({
        where: {
          id: sessionId,
          cuentaUsuario: { id: userId },
          revocadoEn: IsNull(),
        },
      });

      if (!session) {
        throw new NotFoundException('La sesión no existe o ya fue cerrada.');
      }

      await sessions.update(session.id, { revocadoEn: new Date() });
    });
  }
}
