import { BadRequestException } from '@nestjs/common';

const FOREIGN_KEY_VIOLATION = '23503';
const CHECK_VIOLATION = '23514';

/** Mensajes para las restricciones definidas en las migraciones 015 y 016. */
const CONSTRAINT_MESSAGES: Record<string, string> = {
  fk_driver_user_account: 'La cuenta de usuario indicada no existe.',
  fk_driver_crew: 'La cuadrilla indicada no existe.',
  fk_crew_member_crew: 'La cuadrilla indicada no existe.',
  ck_driver_dates: 'La fecha de fin no puede ser anterior a la de inicio.',
};

type PostgresError = { code?: string; constraint?: string };

/**
 * Convierte una violación de restricción de PostgreSQL en un error 400 con un
 * mensaje claro. Cualquier otro error se devuelve sin cambios.
 */
export function translateDatabaseError(error: unknown): unknown {
  const driverError = (error as { driverError?: PostgresError } | null)
    ?.driverError;
  const message = driverError?.constraint
    ? CONSTRAINT_MESSAGES[driverError.constraint]
    : undefined;
  const isKnownViolation =
    driverError?.code === FOREIGN_KEY_VIOLATION ||
    driverError?.code === CHECK_VIOLATION;

  return message && isKnownViolation ? new BadRequestException(message) : error;
}
