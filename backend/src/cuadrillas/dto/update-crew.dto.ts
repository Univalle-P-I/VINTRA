import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * Contrato de entrada para actualizar una cuadrilla. Omitir un campo lo deja
 * sin cambios; `null` se rechaza.
 */
export class UpdateCrewDto {
  @ValidateIf((_dto, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  /** `false` da de baja (baja lógica) y `true` restaura. */
  @ValidateIf((_dto, value: unknown) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
