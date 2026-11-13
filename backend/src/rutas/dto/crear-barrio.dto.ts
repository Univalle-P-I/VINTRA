import { Transform } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

import { GeoJsonGeometryValidator } from '../../comun/geojson.validator';

export class CrearBarrioDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  commune?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @IsObject()
  @Validate(GeoJsonGeometryValidator, ['MultiPolygon'])
  geometry: Record<string, unknown>;
}
