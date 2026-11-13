import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CrearMicrorutaHorarioDto {
  @IsUUID()
  microrouteId: string;

  @IsUUID()
  scheduleId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;
}
