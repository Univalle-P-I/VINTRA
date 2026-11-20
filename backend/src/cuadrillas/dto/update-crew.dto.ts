import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/** Contrato de entrada para actualizar una cuadrilla. */
export class UpdateCrewDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  /** `false` da de baja (baja lógica) y `true` restaura. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
