import { BadRequestException, ConflictException } from '@nestjs/common';

import {
  assertValidStatusTransition,
  isVehicleAssignable,
  VEHICLE_STATUS_CATALOG,
} from './estado-vehiculo.rules';
import { EstadoVehiculo } from '../entidades/vehiculo.entity';

describe('estado-vehiculo.rules', () => {
  describe('VEHICLE_STATUS_CATALOG', () => {
    it('expone los 4 estados operativos del dominio', () => {
      expect(VEHICLE_STATUS_CATALOG.map((item) => item.code)).toEqual([
        EstadoVehiculo.DISPONIBLE,
        EstadoVehiculo.EN_SERVICIO,
        EstadoVehiculo.MANTENIMIENTO,
        EstadoVehiculo.FUERA_DE_SERVICIO,
      ]);
    });
  });

  describe('isVehicleAssignable', () => {
    it('retorna true solo cuando activo es true y estado es available', () => {
      expect(
        isVehicleAssignable({
          activo: true,
          estado: EstadoVehiculo.DISPONIBLE,
        }),
      ).toBe(true);

      expect(
        isVehicleAssignable({
          activo: false,
          estado: EstadoVehiculo.DISPONIBLE,
        }),
      ).toBe(false);

      expect(
        isVehicleAssignable({
          activo: true,
          estado: EstadoVehiculo.EN_SERVICIO,
        }),
      ).toBe(false);

      expect(
        isVehicleAssignable({
          activo: true,
          estado: EstadoVehiculo.MANTENIMIENTO,
        }),
      ).toBe(false);

      expect(
        isVehicleAssignable({
          activo: true,
          estado: EstadoVehiculo.FUERA_DE_SERVICIO,
        }),
      ).toBe(false);
    });
  });

  describe('assertValidStatusTransition', () => {
    it('permite transiciones operativas vÃ¡lidas', () => {
      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.DISPONIBLE,
          targetStatus: EstadoVehiculo.EN_SERVICIO,
        }),
      ).not.toThrow();

      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.EN_SERVICIO,
          targetStatus: EstadoVehiculo.DISPONIBLE,
        }),
      ).not.toThrow();

      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.FUERA_DE_SERVICIO,
          targetStatus: EstadoVehiculo.MANTENIMIENTO,
        }),
      ).not.toThrow();

      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.MANTENIMIENTO,
          targetStatus: EstadoVehiculo.DISPONIBLE,
        }),
      ).not.toThrow();
    });

    it('rechaza con ConflictException transiciones invÃ¡lidas o repetidas', () => {
      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.DISPONIBLE,
          targetStatus: EstadoVehiculo.DISPONIBLE,
        }),
      ).toThrow(ConflictException);

      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.FUERA_DE_SERVICIO,
          targetStatus: EstadoVehiculo.DISPONIBLE,
        }),
      ).toThrow(ConflictException);

      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.FUERA_DE_SERVICIO,
          targetStatus: EstadoVehiculo.EN_SERVICIO,
        }),
      ).toThrow(ConflictException);
    });

    it('exige motivo descriptivo al inhabilitar (out_of_service) por falla mecÃ¡nica [C2]', () => {
      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.DISPONIBLE,
          targetStatus: EstadoVehiculo.FUERA_DE_SERVICIO,
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.DISPONIBLE,
          targetStatus: EstadoVehiculo.FUERA_DE_SERVICIO,
          reason: 'abc',
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        assertValidStatusTransition({
          currentStatus: EstadoVehiculo.DISPONIBLE,
          targetStatus: EstadoVehiculo.FUERA_DE_SERVICIO,
          reason: 'Falla en sistema hidrÃ¡ulico de compactaciÃ³n',
        }),
      ).not.toThrow();
    });
  });
});
