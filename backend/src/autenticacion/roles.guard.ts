import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Perfil } from '../perfiles/entidades/perfil.entity';
import type { AuthenticatedUser } from './authenticated-user';
import { ROLES_KEY } from './roles.decorator';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<
      Perfil['rol'][]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Se requiere una identidad autenticada.');
    }

    const profiles = await this.perfilRepository.find({
      where: {
        cuentaUsuario: { id: user.userId },
        activo: true,
      },
    });

    if (!profiles.some((profile) => roles.includes(profile.rol))) {
      throw new ForbiddenException('No tiene permisos para esta operación.');
    }

    return true;
  }
}
