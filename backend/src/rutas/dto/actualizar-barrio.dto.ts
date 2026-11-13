import { PartialType } from '@nestjs/mapped-types';
import { CrearBarrioDto } from './crear-barrio.dto';

export class ActualizarBarrioDto extends PartialType(CrearBarrioDto) {}
