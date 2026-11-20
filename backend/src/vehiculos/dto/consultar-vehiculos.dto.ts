import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { EstadoVehiculo } from '../entidades/vehiculo.entity';

export class ConsultarVehiculosDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filtra por ID del tipo de vehículo.' })
  @IsOptional()
  @IsUUID('4', { message: 'El tipo de vehículo debe ser un UUID válido.' })
  vehicleTypeId?: string;

  @ApiPropertyOptional({ enum: EstadoVehiculo, description: 'Filtra por estado operativo del vehículo.' })
  @IsOptional()
  @IsEnum(EstadoVehiculo, {
    message: 'El estado debe ser available, in_service, maintenance u out_of_service.',
  })
  vehicleStatus?: EstadoVehiculo;

  @ApiPropertyOptional({ description: 'Filtra por coincidencia parcial en la placa.', maxLength: 6 })
  @IsOptional()
  @IsString()
  @MaxLength(6, { message: 'La placa no puede exceder 6 caracteres.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  plate?: string;

  @ApiPropertyOptional({ type: Boolean, description: 'Filtra por estado activo/inactivo.' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'El parámetro isActive debe ser booleano (true o false).' })
  isActive?: boolean;

  @ApiPropertyOptional({ type: Number, minimum: 1, description: 'Número de página.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(1, { message: 'La página mínima es 1.' })
  page?: number;

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, description: 'Resultados por página.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @Min(1, { message: 'El límite mínimo es 1.' })
  @Max(100, { message: 'El límite máximo es 100.' })
  limit?: number;
}