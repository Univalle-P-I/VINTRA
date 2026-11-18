import { SetMetadata } from '@nestjs/common';
import { roles } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';

/** Declara los roles que pueden acceder a una ruta o controlador. */
export const Roles = (...requiredRoles: roles[]) =>
  SetMetadata(ROLES_KEY, requiredRoles);
