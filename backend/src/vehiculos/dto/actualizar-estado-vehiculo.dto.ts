import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { EstadoVehiculo } from '../entidades/vehiculo.entity';

export class ActualizarEstadoVehiculoDto {
  @IsEnum(EstadoVehiculo)
  vehicleStatus!: EstadoVehiculo;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(500)
  reason?: string;
}
