import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

import { EstadoVehiculo } from '../entidades/vehiculo.entity';

export class ActualizarVehiculoDto {
  @IsOptional()
  @IsUUID()
  vehicleTypeId?: string;

  @IsOptional()
  @IsEnum(EstadoVehiculo)
  vehicleStatus?: EstadoVehiculo;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(6, 6)
  plate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+(?:\.\d+)?$/)
  capacityKg?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+(?:\.\d+)?$/)
  capacityYd3?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(500)
  reason?: string;
}
