import { PartialType } from '@nestjs/mapped-types';

import { CrearMicrorutaDto } from './crear-microruta.dto';

export class ActualizarMicrorutaDto extends PartialType(CrearMicrorutaDto) {}
