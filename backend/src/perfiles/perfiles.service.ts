import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { CuentaUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { Perfil } from './entidades/perfil.entity';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { CrearPerfilDto } from './dto/crear-perfil.dto';

export interface PerfilPublico {
  id: string;
  userAccountId: string;
  role: Perfil['rol'];
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class PerfilesService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
    @InjectRepository(CuentaUsuario)
    private readonly cuentaRepository: Repository<CuentaUsuario>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async listarPorCuenta(userAccountId: string): Promise<PerfilPublico[]> {
    const profiles = await this.perfilRepository.find({
      where: { cuentaUsuario: { id: userAccountId } },
      order: { creadoEn: 'ASC' },
    });
    return profiles.map((profile) => this.toPublic(profile, userAccountId));
  }

  async crear(
    dto: CrearPerfilDto,
    actorId: string,
    requestIp: string,
  ): Promise<PerfilPublico> {
    const account = await this.cuentaRepository.findOneBy({
      id: dto.userAccountId,
    });
    if (!account) {
      throw new NotFoundException('La cuenta de usuario no existe.');
    }

    try {
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        async (manager) => {
          const repository = manager.getRepository(Perfil);
          const profile = await repository.save(
            repository.create({
              cuentaUsuario: account,
              rol: dto.role,
              activo: true,
            }),
          );
          return this.toPublic(profile, account.id);
        },
      );
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'La cuenta ya tiene un perfil con ese rol.',
        );
      }
      throw error;
    }
  }

  async actualizar(
    id: string,
    dto: ActualizarPerfilDto,
    actorId: string,
    requestIp: string,
  ): Promise<PerfilPublico> {
    return this.contextoAuditoria.ejecutar(
      actorId,
      requestIp,
      async (manager) => {
        const repository = manager.getRepository(Perfil);
        const profile = await repository.findOne({
          where: { id },
          relations: { cuentaUsuario: true },
        });
        if (!profile) {
          throw new NotFoundException('El perfil no existe.');
        }

        profile.activo = dto.isActive;
        const saved = await repository.save(profile);
        return this.toPublic(saved, profile.cuentaUsuario.id);
      },
    );
  }

  private toPublic(profile: Perfil, userAccountId: string): PerfilPublico {
    return {
      id: profile.id,
      userAccountId,
      role: profile.rol,
      isActive: profile.activo,
      createdAt: profile.creadoEn,
    };
  }
}
