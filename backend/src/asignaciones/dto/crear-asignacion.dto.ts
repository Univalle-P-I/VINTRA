import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsUUID } from 'class-validator';

import { EstadoAsignacion } from '../entidades/asignacion.entity';

export class CrearAsignacionDto {
  @IsUUID()
  driverId: string;

  @IsUUID()
  microrouteScheduleId: string;

  @IsUUID()
  vehicleId: string;

  @IsEnum(EstadoAsignacion)
  assignmentStatus: EstadoAsignacion;

  @Type(() => Date)
  @IsDate()
  scheduledStartAt: Date;

  @Type(() => Date)
  @IsDate()
  scheduledEndAt: Date;
}
