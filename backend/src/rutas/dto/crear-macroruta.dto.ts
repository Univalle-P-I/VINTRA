import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

import { GeoJsonGeometryValidator } from '../../comun/geojson.validator';

export class CrearMacrorutaDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  code: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsObject()
  @Validate(GeoJsonGeometryValidator, ['MultiLineString'])
  geometry: Record<string, unknown>;
}
