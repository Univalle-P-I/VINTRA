import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

/**
 * Contrato de entrada para registrar un conductor (tabla `driver`).
 * `userAccountId` referencia a `user_account`; el módulo Usuarios (#125)
 * define esa entidad.
 */
export class CreateDriverDto {
  @IsUUID()
  userAccountId!: string;

  @IsOptional()
  @IsUUID()
  crewId?: string;

  /** ISO 8601. Si se omite, la base de datos usa la fecha actual. */
  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  startedAt?: string;
}
