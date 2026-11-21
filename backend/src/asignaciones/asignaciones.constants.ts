/**
 * Reglas de asignación (VIN-030 / #93) alineadas con
 * database/migrations/007 (vehicle) y 017 (assignment).
 */

export enum EstadoAsignacion {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EstadoVehiculo {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

/** Estado con el que nace una asignación. */
export const ESTADO_ASIGNACION_INICIAL = EstadoAsignacion.SCHEDULED;

/**
 * Asignaciones que ocupan recursos. COMPLETED y CANCELLED los liberan.
 */
export const ESTADOS_ASIGNACION_VIGENTES: EstadoAsignacion[] = [
  EstadoAsignacion.SCHEDULED,
  EstadoAsignacion.IN_PROGRESS,
];

/**
 * Estados de vehículo que impiden asignarlo.
 *
 * SUPUESTO: IN_USE no bloquea, porque un vehículo en recorrido puede quedar
 * programado para otro horario; el solapamiento de horarios ya lo controla el
 * chequeo de conflicto temporal.
 */
export const ESTADOS_VEHICULO_NO_ASIGNABLES: EstadoVehiculo[] = [
  EstadoVehiculo.MAINTENANCE,
  EstadoVehiculo.OUT_OF_SERVICE,
];

/**
 * `schedule.start_time` / `end_time` son TIME sin zona. Se interpretan en la
 * hora local de Buenaventura (UTC-5, sin horario de verano).
 */
export const OFFSET_ZONA_HORARIA = '-05:00';

/** Código de error de PostgreSQL para violación de restricción única. */
export const PG_VIOLACION_UNICA = '23505';
