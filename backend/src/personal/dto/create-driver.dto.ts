import { IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { IsIsoDateTimeWithZone } from '../validators/is-iso-date-time-with-zone';

/**
 * Contrato de entrada para registrar un conductor (tabla `driver`).
 * `userAccountId` referencia a `user_account`; el módulo Usuarios (#125)
 * define esa entidad.
 */
export class CreateDriverDto {
  @IsUUID()
  userAccountId!: string;

  /** Opcional: omitirlo o enviar `null` deja al conductor sin cuadrilla. */
  @IsOptional()
  @IsUUID()
  crewId?: string | null;

  /**
   * Fecha y hora ISO 8601 con zona horaria (Z o ±HH:MM). Si se omite, la base
   * de datos usa la fecha actual; `null` se rechaza.
   */
  @ValidateIf((_dto, value: unknown) => value !== undefined)
  @IsIsoDateTimeWithZone()
  startedAt?: string;
}
