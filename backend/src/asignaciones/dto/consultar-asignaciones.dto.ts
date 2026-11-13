import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

import { EstadoAsignacion } from '../entidades/asignacion.entity';

export class ConsultarAsignacionesDto {
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  crewId?: string;

  @IsOptional()
  @IsUUID()
  microrouteScheduleId?: string;

  @IsOptional()
  @IsUUID()
  microrouteId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsEnum(EstadoAsignacion)
  assignmentStatus?: EstadoAsignacion;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledStartAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledEndAt?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
