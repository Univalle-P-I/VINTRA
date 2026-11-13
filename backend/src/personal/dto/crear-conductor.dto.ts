import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';

import { TipoDocumento } from '../../usuarios/entidades/cuenta-usuario.entity';
import { CrearDatosUsuarioBaseDto } from '../../usuarios/dto/campos-usuario.dto';

export class CrearConductorDto extends CrearDatosUsuarioBaseDto {
  @IsEnum(TipoDocumento)
  documentType: TipoDocumento;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentId: string;

  @IsOptional()
  @IsUUID()
  crewId?: string | null;
}
