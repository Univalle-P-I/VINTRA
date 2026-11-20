import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { TipoDocumento } from '../entidades/cuenta-usuario.entity';
import { RolUsuario } from '../../perfiles/entidades/perfil.entity';
import { CrearDatosUsuarioBaseDto } from './campos-usuario.dto';

export class CrearUsuarioInternoDto extends CrearDatosUsuarioBaseDto {
  @IsEnum(TipoDocumento)
  documentType: TipoDocumento;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentId: string;

  @IsEnum(RolUsuario)
  role: RolUsuario;
}
