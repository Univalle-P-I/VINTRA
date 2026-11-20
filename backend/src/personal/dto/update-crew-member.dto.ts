import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * Contrato de entrada para actualizar un miembro de cuadrilla. Solo `crewId`
 * admite `null` (lo saca de su cuadrilla); en `fullName` e `isActive` se
 * rechaza.
 */
export class UpdateCrewMemberDto {
  @ValidateIf((_dto, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsUUID()
  crewId?: string | null;

  /** `false` da de baja (baja lógica) y `true` restaura. */
  @ValidateIf((_dto, value: unknown) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
