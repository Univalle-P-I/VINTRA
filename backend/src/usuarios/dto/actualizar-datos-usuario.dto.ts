import { ActualizarDatosUsuarioBaseDto } from './campos-usuario.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarDatosUsuarioDto extends ActualizarDatosUsuarioBaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
