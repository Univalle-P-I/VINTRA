import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class BarrioOrdenDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  barrioId: string;

  @ApiProperty({ minimum: 1, type: Number })
  @IsInt()
  @Min(1)
  ordenVisita: number;
}

export class AsociarBarriosDto {
  @ApiProperty({ type: [BarrioOrdenDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BarrioOrdenDto)
  barrios: BarrioOrdenDto[];
}
