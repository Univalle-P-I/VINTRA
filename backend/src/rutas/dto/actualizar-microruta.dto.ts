import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

import { GeoJsonGeometryValidator } from '../../comun/geojson.validator';

export class ActualizarMicrorutaDto {
  @IsOptional()
  @IsUUID()
  macrorouteId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  code?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsObject()
  @Validate(GeoJsonGeometryValidator, ['MultiLineString'])
  geometry?: Record<string, unknown>;
}
