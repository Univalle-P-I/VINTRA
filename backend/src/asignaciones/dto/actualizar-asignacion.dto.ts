import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

import { CrearAsignacionDto } from './crear-asignacion.dto';

export class ActualizarAsignacionDto extends PartialType(CrearAsignacionDto) {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startedAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endedAt?: Date | null;
}
