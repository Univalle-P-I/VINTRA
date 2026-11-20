import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/**
 * Contrato de entrada para actualizar un miembro de cuadrilla. `null` en
 * `crewId` lo saca de su cuadrilla.
 */
export class UpdateCrewMemberDto {
  @IsOptional()
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
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
