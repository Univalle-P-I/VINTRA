import {
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { IsIsoDateTimeWithZone } from '../validators/is-iso-date-time-with-zone';

/**
 * Contrato de entrada para actualizar un conductor. Solo `crewId` y `endedAt`
 * admiten `null` (limpian el valor); en `startedAt` e `isActive` se rechaza.
 * No se puede cambiar la cuenta de usuario.
 */
export class UpdateDriverDto {
  @IsOptional()
  @IsUUID()
  crewId?: string | null;

  @ValidateIf((_dto, value: unknown) => value !== undefined)
  @IsIsoDateTimeWithZone()
  startedAt?: string;

  @IsOptional()
  @IsIsoDateTimeWithZone()
  endedAt?: string | null;

  /** `false` da de baja (baja lógica) y `true` restaura. */
  @ValidateIf((_dto, value: unknown) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
