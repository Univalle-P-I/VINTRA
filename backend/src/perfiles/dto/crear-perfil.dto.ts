import { IsEnum, IsUUID } from 'class-validator';

import { RolUsuario } from '../entidades/perfil.entity';

export class CrearPerfilDto {
  @IsUUID()
  userAccountId: string;

  @IsEnum(RolUsuario)
  role: RolUsuario;
}
