import { Type } from 'class-transformer';
import { IsDate, IsObject, IsUUID, Validate } from 'class-validator';

import { GeoJsonGeometryValidator } from '../../comun/geojson.validator';

export class CrearPosicionVehiculoDto {
  @IsUUID()
  assignmentId: string;

  @IsObject()
  @Validate(GeoJsonGeometryValidator, ['Point'])
  geometry: Record<string, unknown>;

  @Type(() => Date)
  @IsDate()
  recordedAt: Date;
}
