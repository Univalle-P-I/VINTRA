import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CrearMicrorutaBarrioDto {
  @IsUUID()
  microrouteId: string;

  @IsUUID()
  neighborhoodId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderVisit: number;
}
