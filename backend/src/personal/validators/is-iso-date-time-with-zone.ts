import { BadRequestException } from '@nestjs/common';
import { buildMessage, ValidateBy } from 'class-validator';
import type { ValidationOptions } from 'class-validator';

/**
 * Fecha y hora ISO 8601 completas con zona horaria: `AAAA-MM-DDTHH:MM:SS`,
 * fracción de segundo opcional y `Z` o desfase `±HH:MM`.
 * Ejemplos: `2026-11-19T08:00:00Z` y `2026-11-19T03:00:00-05:00`.
 */
const ISO_DATE_TIME_WITH_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(?:Z|[+-](\d{2}):(\d{2}))$/;

export function isIsoDateTimeWithZone(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const match = ISO_DATE_TIME_WITH_ZONE.exec(value);
  if (!match) {
    return false;
  }
  const [year, month, day, hour, minute, second] = match
    .slice(1, 7)
    .map(Number);
  const offsetHour = Number(match[7] ?? 0);
  const offsetMinute = Number(match[8] ?? 0);

  // `Date` corrige en silencio fechas imposibles (30 de febrero pasa a marzo),
  // por eso se comprueba el calendario a mano.
  const calendar = new Date(Date.UTC(year, month - 1, day));
  const isRealDay =
    calendar.getUTCFullYear() === year &&
    calendar.getUTCMonth() === month - 1 &&
    calendar.getUTCDate() === day;

  return (
    isRealDay &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59 &&
    offsetHour <= 23 &&
    offsetMinute <= 59 &&
    !Number.isNaN(Date.parse(value))
  );
}

/** Convierte a `Date` o responde 400 si el texto no es una fecha válida. */
export function parseIsoDateTime(value: unknown): Date {
  if (!isIsoDateTimeWithZone(value)) {
    throw new BadRequestException(
      'La fecha debe ser ISO 8601 completa con zona horaria, por ejemplo 2026-11-19T08:00:00Z.',
    );
  }
  return new Date(value);
}

export function IsIsoDateTimeWithZone(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isIsoDateTimeWithZone',
      validator: {
        validate: (value: unknown) => isIsoDateTimeWithZone(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}$property debe ser una fecha y hora ISO 8601 completa con zona horaria (Z o ±HH:MM), por ejemplo 2026-11-19T08:00:00Z`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
