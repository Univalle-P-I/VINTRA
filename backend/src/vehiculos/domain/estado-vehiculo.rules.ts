import { BadRequestException, ConflictException } from '@nestjs/common';
import { EstadoVehiculo } from '../entidades/vehiculo.entity';

export const ALLOWED_STATUS_TRANSITIONS: Readonly<
  Record<EstadoVehiculo, readonly EstadoVehiculo[]>
> = {
  [EstadoVehiculo.DISPONIBLE]: [
    EstadoVehiculo.EN_SERVICIO,
    EstadoVehiculo.MANTENIMIENTO,
    EstadoVehiculo.FUERA_DE_SERVICIO,
  ],
  [EstadoVehiculo.EN_SERVICIO]: [
    EstadoVehiculo.DISPONIBLE,
    EstadoVehiculo.MANTENIMIENTO,
    EstadoVehiculo.FUERA_DE_SERVICIO,
  ],
  [EstadoVehiculo.MANTENIMIENTO]: [
    EstadoVehiculo.DISPONIBLE,
    EstadoVehiculo.FUERA_DE_SERVICIO,
  ],
  [EstadoVehiculo.FUERA_DE_SERVICIO]: [EstadoVehiculo.MANTENIMIENTO],
};

export interface EstadoVehiculoCatalogItem {
  code: EstadoVehiculo;
  dbCode: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  label: string;
  allowsAssignment: boolean;
  allowedNextStatuses: readonly EstadoVehiculo[];
}

export const VEHICLE_STATUS_CATALOG: readonly EstadoVehiculoCatalogItem[] = [
  {
    code: EstadoVehiculo.DISPONIBLE,
    dbCode: 'AVAILABLE',
    label: 'Disponible',
    allowsAssignment: true,
    allowedNextStatuses: ALLOWED_STATUS_TRANSITIONS[EstadoVehiculo.DISPONIBLE],
  },
  {
    code: EstadoVehiculo.EN_SERVICIO,
    dbCode: 'IN_USE',
    label: 'En servicio',
    allowsAssignment: false,
    allowedNextStatuses: ALLOWED_STATUS_TRANSITIONS[EstadoVehiculo.EN_SERVICIO],
  },
  {
    code: EstadoVehiculo.MANTENIMIENTO,
    dbCode: 'MAINTENANCE',
    label: 'En mantenimiento',
    allowsAssignment: false,
    allowedNextStatuses:
      ALLOWED_STATUS_TRANSITIONS[EstadoVehiculo.MANTENIMIENTO],
  },
  {
    code: EstadoVehiculo.FUERA_DE_SERVICIO,
    dbCode: 'OUT_OF_SERVICE',
    label: 'Fuera de servicio (Inhabilitado)',
    allowsAssignment: false,
    allowedNextStatuses:
      ALLOWED_STATUS_TRANSITIONS[EstadoVehiculo.FUERA_DE_SERVICIO],
  },
];

export function isVehicleAssignable(params: {
  activo: boolean;
  estado: EstadoVehiculo;
}): boolean {
  return (
    params.activo === true && params.estado === EstadoVehiculo.DISPONIBLE
  );
}

export function assertValidStatusTransition(params: {
  currentStatus: EstadoVehiculo;
  targetStatus: EstadoVehiculo;
  reason?: string | null;
}): void {
  const { currentStatus, targetStatus } = params;

  if (currentStatus === targetStatus) {
    throw new ConflictException({
      code: 'VEHICLE_STATUS_UNCHANGED',
      message: `El vehÃ­culo ya se encuentra en el estado operativo ${currentStatus}.`,
    });
  }

  const allowedTargets = ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];
  if (!allowedTargets.includes(targetStatus)) {
    throw new ConflictException({
      code: 'INVALID_VEHICLE_STATUS_TRANSITION',
      message: `TransiciÃ³n de estado no permitida: ${currentStatus} -> ${targetStatus}. Transiciones vÃ¡lidas desde ${currentStatus}: ${allowedTargets.join(', ')}.`,
    });
  }

  if (targetStatus === EstadoVehiculo.FUERA_DE_SERVICIO) {
    const trimmedReason = params.reason?.trim() ?? '';
    if (trimmedReason.length < 5) {
      throw new BadRequestException({
        code: 'FAILURE_REASON_REQUIRED',
        message:
          'Para inhabilitar un vehÃ­culo (out_of_service) por falla mecÃ¡nica o condiciÃ³n operativa debe indicar un motivo descriptivo (mÃ­nimo 5 caracteres).',
      });
    }
  }
}
