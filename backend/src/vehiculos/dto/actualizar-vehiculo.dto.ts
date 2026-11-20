import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  IsBoolean,
  IsEnum,
  Matches,
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
}
