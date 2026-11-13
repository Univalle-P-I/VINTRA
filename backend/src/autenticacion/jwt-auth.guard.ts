import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import { createHash } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import type { Repository } from 'typeorm';
import type { Request } from 'express';

import { CuentaUsuario, EstadoUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { Sesion } from './entidades/sesion.entity';
import type { AuthenticatedUser } from './authenticated-user';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface AccessTokenPayload {
  sub?: unknown;
  exp?: unknown;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Sesion)
    private readonly sesionRepository: Repository<Sesion>,
    @InjectRepository(CuentaUsuario)
    private readonly cuentaRepository: Repository<CuentaUsuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const [scheme, token, extra] = authorization?.split(' ') ?? [];

    if (scheme?.toLowerCase() !== 'bearer' || !token || extra !== undefined) {
      throw new UnauthorizedException('Se requiere un token Bearer válido.');
    }

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('El token no es válido o ha expirado.');
    }

    if (
      typeof payload.sub !== 'string' ||
      !isUUID(payload.sub) ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('El token no es válido o ha expirado.');
    }

    const hashToken = createHash('sha256').update(token).digest('hex');
    const session = await this.sesionRepository.findOne({
      where: { hashToken, revocadoEn: IsNull() },
      relations: { cuentaUsuario: true },
    });
    if (
      !session ||
      session.expiraEn.getTime() <= Date.now() ||
      session.cuentaUsuario?.id !== payload.sub
    ) {
      throw new UnauthorizedException('La sesión no es válida o fue revocada.');
    }

    const account = await this.cuentaRepository.findOne({
      where: { id: payload.sub },
    });
    if (
      !account ||
      account.estado !== EstadoUsuario.ACTIVO ||
      (account.bloqueadoHasta !== null &&
        account.bloqueadoHasta.getTime() > Date.now())
    ) {
      throw new UnauthorizedException('La cuenta no está habilitada.');
    }

    await this.sesionRepository.update(session.id, {
      ultimoUsoEn: new Date(),
    });
    request.user = { userId: payload.sub, sessionId: session.id };
    return true;
  }
}
