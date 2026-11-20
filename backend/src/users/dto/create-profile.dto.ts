import { IsEnum, IsUUID } from 'class-validator';
import { roles } from '../../common/enums/roles.enum.js';

/** Assigns one of the existing roles to an account. */
export class CreateProfileDto {
  @IsUUID('4', { message: 'El identificador de la cuenta debe ser un UUID válido.' })
  userAccountId!: string;

  @IsEnum(roles, { message: 'El rol indicado no es válido.' })
  userRole!: roles;
}
