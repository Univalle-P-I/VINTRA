import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';

import { ActualizarDatosUsuarioBaseDto } from '../../usuarios/dto/campos-usuario.dto';

export class ActualizarConductorDto extends ActualizarDatosUsuarioBaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @IsUUID()
  crewId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
