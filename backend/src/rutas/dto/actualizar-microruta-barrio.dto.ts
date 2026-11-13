import { PartialType } from '@nestjs/mapped-types';
import { CrearMicrorutaBarrioDto } from './crear-microruta-barrio.dto';

export class ActualizarMicrorutaBarrioDto extends PartialType(CrearMicrorutaBarrioDto) {}
