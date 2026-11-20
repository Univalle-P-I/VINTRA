import { IsBoolean, IsISO8601, IsOptional, IsUUID } from 'class-validator';

/**
 * Contrato de entrada para actualizar un conductor. `null` en `crewId` o
 * `endedAt` limpia el valor. No se puede cambiar la cuenta de usuario.
 */
export class UpdateDriverDto {
  @IsOptional()
  @IsUUID()
  crewId?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  startedAt?: string;

  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  endedAt?: string | null;

  /** `false` da de baja (baja lógica) y `true` restaura. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
