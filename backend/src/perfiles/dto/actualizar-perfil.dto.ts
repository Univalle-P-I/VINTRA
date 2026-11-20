import { IsBoolean } from 'class-validator';

export class ActualizarPerfilDto {
  @IsBoolean()
  isActive: boolean;
}
