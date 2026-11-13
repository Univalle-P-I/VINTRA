import { IsUUID } from 'class-validator';

import { CamposRutaLinealDto } from './campos-ruta-lineal.dto';

export class CrearMicrorutaDto extends CamposRutaLinealDto {
  @IsUUID()
  macrorouteId: string;
}
