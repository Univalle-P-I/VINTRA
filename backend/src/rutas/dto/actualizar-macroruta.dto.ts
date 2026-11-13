import { PartialType } from '@nestjs/mapped-types';
import { CrearMacrorutaDto } from './crear-macroruta.dto';

export class ActualizarMacrorutaDto extends PartialType(CrearMacrorutaDto) {}
