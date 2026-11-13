import { IsEnum } from 'class-validator';

import { EstadoVehiculo } from '../entidades/vehiculo.entity';

export class ActualizarEstadoVehiculoDto {
  @IsEnum(EstadoVehiculo)
  vehicleStatus: EstadoVehiculo;
}
