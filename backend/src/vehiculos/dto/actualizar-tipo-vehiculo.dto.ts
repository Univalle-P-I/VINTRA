import { PartialType } from '@nestjs/mapped-types';
import { CrearTipoVehiculoDto } from './crear-tipo-vehiculo.dto';

export class ActualizarTipoVehiculoDto extends PartialType(
  CrearTipoVehiculoDto,
) {}
