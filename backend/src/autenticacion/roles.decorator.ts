import { SetMetadata } from '@nestjs/common';

import { RolUsuario } from '../perfiles/entidades/perfil.entity';

export const ROLES_KEY = 'vintra:roles';

export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
