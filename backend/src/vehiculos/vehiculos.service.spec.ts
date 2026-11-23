import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TipoVehiculo } from './entidades/tipo-vehiculo.entity';
import { VehiculoAuditLog } from './entidades/vehiculo-audit-log.entity';
import { EstadoVehiculo, Vehiculo } from './entidades/vehiculo.entity';
import { VehiculosService } from './vehiculos.service';

describe('VehiculosService', () => {
  let service: VehiculosService;
  const tipoMock: TipoVehiculo = { id: '00000000-0000-4000-8000-000000000001', codigo: 'COMP', nombre: 'Compactador', activo: true, creadoEn: new Date('2026-11-21T00:00:00.000Z') };
  let vehiculoMock: Vehiculo;
  const tipoRepoMock = { find: jest.fn(), findOne: jest.fn(), findOneBy: jest.fn(), create: jest.fn((v: Partial<TipoVehiculo>) => ({ ...tipoMock, ...v })), save: jest.fn(async (v: TipoVehiculo) => ({ ...v })) };
  const vehiculoRepoMock = { findOne: jest.fn(), create: jest.fn((v: Partial<Vehiculo>) => ({ ...vehiculoMock, ...v })), save: jest.fn(async (v: Vehiculo) => ({ ...v })), createQueryBuilder: jest.fn() };
  const auditRepoMock = { create: jest.fn((v: Partial<VehiculoAuditLog>) => v), save: jest.fn(async (v: Partial<VehiculoAuditLog>) => v) };
  const dataSourceMock = { transaction: jest.fn(async (cb: (m: { getRepository: (e: unknown) => unknown }) => unknown) => cb({ getRepository: (e: unknown) => (e === TipoVehiculo ? tipoRepoMock : e === Vehiculo ? vehiculoRepoMock : auditRepoMock) })) };

  beforeEach(async () => {
    jest.clearAllMocks();
    vehiculoMock = { id: '11111111-1111-4111-8111-111111111111', tipoVehiculo: tipoMock, estado: EstadoVehiculo.DISPONIBLE, placa: 'ABC123', capacidadKg: '8500', capacidadYd3: '16.5', activo: true, actualizadoEn: new Date('2026-11-21T00:00:00.000Z'), creadoEn: new Date('2026-11-21T00:00:00.000Z') };
    const mod = await Test.createTestingModule({ providers: [VehiculosService, { provide: getRepositoryToken(TipoVehiculo), useValue: tipoRepoMock }, { provide: getRepositoryToken(Vehiculo), useValue: vehiculoRepoMock }, { provide: getRepositoryToken(VehiculoAuditLog), useValue: auditRepoMock }, { provide: DataSource, useValue: dataSourceMock }] }).compile();
    service = mod.get(VehiculosService);
  });

  it('gestiona tipos de vehículo y maneja errores', async () => {
    expect(service.listarEstados().length).toBeGreaterThanOrEqual(4);
    tipoRepoMock.find.mockResolvedValue([tipoMock]);
    await expect(service.listarTipos()).resolves.toEqual([tipoMock]);
    expect((await service.crearTipo({ code: 'COMP', name: 'Compactador' }, 'u1', '127.0.0.1')).codigo).toBe('COMP');
    tipoRepoMock.save.mockRejectedValueOnce({ code: '23505' });
    await expect(service.crearTipo({ code: 'COMP', name: 'Dup' }, 'u1', '')).rejects.toThrow(ConflictException);
    tipoRepoMock.findOneBy.mockResolvedValueOnce(null);
    await expect(service.actualizarTipo('x', { name: 'N' }, 'u1', '127.0.0.1')).rejects.toThrow(NotFoundException);
    tipoRepoMock.findOneBy.mockResolvedValueOnce({ ...tipoMock });
    expect((await service.actualizarTipo(tipoMock.id, { code: 'V', name: 'Volq', isActive: false }, 'u1', '')).activo).toBe(false);
    tipoRepoMock.findOneBy.mockResolvedValueOnce({ ...tipoMock });
    tipoRepoMock.save.mockRejectedValueOnce({ code: '23505' });
    await expect(service.actualizarTipo(tipoMock.id, { code: 'DUP' }, 'u1', '')).rejects.toThrow(ConflictException);
  });
  it('lista, filtra, pagina y obtiene vehículos', async () => {
    const qb = { leftJoinAndSelect: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([vehiculoMock]) };
    vehiculoRepoMock.createQueryBuilder.mockReturnValue(qb);
    expect((await service.listar({ onlyAssignable: true }))[0].esAsignable).toBe(true);
    expect(await service.listar({ isActive: false, status: EstadoVehiculo.MANTENIMIENTO, vehicleTypeId: tipoMock.id, plate: 'ABC', page: 2, limit: 5 })).toHaveLength(1);
    vehiculoRepoMock.findOne.mockResolvedValueOnce(vehiculoMock);
    await expect(service.obtener(vehiculoMock.id)).resolves.toMatchObject({ esAsignable: true });
    vehiculoRepoMock.findOne.mockResolvedValueOnce(null);
    await expect(service.obtener('none')).rejects.toThrow(NotFoundException);
  });

  it('crea, actualiza y cambia estado de vehículos con reglas y auditoría', async () => {
    await expect(service.crear({ vehicleTypeId: tipoMock.id, vehicleStatus: EstadoVehiculo.FUERA_DE_SERVICIO, plate: 'ABC123', capacityKg: '8000', capacityYd3: '15', reason: 'abc' }, 'u1', '')).rejects.toThrow(BadRequestException);
    tipoRepoMock.findOne.mockResolvedValueOnce(null);
    await expect(service.crear({ vehicleTypeId: tipoMock.id, vehicleStatus: EstadoVehiculo.DISPONIBLE, plate: 'ABC123', capacityKg: '8000', capacityYd3: '15' }, 'u1', '')).rejects.toThrow(NotFoundException);
    tipoRepoMock.findOne.mockResolvedValueOnce(tipoMock);
    expect((await service.crear({ vehicleTypeId: tipoMock.id, vehicleStatus: EstadoVehiculo.DISPONIBLE, plate: 'ABC123', capacityKg: '8000', capacityYd3: '15' }, 'u1', '127.0.0.1')).esAsignable).toBe(true);
    tipoRepoMock.findOne.mockResolvedValueOnce(tipoMock);
    vehiculoRepoMock.save.mockRejectedValueOnce({ code: '23505' });
    await expect(service.crear({ vehicleTypeId: tipoMock.id, vehicleStatus: EstadoVehiculo.DISPONIBLE, plate: 'ABC123', capacityKg: '8000', capacityYd3: '15' }, 'u1', '')).rejects.toThrow(ConflictException);
    vehiculoRepoMock.findOne.mockResolvedValueOnce(null);
    await expect(service.actualizar('no', { plate: 'XYZ999' }, 'u1', '')).rejects.toThrow(NotFoundException);
    vehiculoRepoMock.findOne.mockResolvedValueOnce({ ...vehiculoMock });
    tipoRepoMock.findOne.mockResolvedValueOnce(null);
    await expect(service.actualizar(vehiculoMock.id, { vehicleTypeId: 'bad' }, 'u1', '')).rejects.toThrow(NotFoundException);
    vehiculoRepoMock.findOne.mockResolvedValueOnce({ ...vehiculoMock });
    tipoRepoMock.findOne.mockResolvedValueOnce(tipoMock);
    expect((await service.actualizar(vehiculoMock.id, { vehicleTypeId: tipoMock.id, vehicleStatus: EstadoVehiculo.MANTENIMIENTO, plate: 'XYZ999', capacityKg: '9000', capacityYd3: '18', isActive: false, reason: 'Taller preventivo' }, 'u1', '127.0.0.1')).esAsignable).toBe(false);
    vehiculoRepoMock.findOne.mockResolvedValueOnce({ ...vehiculoMock });
    vehiculoRepoMock.save.mockRejectedValueOnce({ code: '23505' });
    await expect(service.actualizar(vehiculoMock.id, { plate: 'DUP123' }, 'u1', '')).rejects.toThrow(ConflictException);
    vehiculoRepoMock.findOne.mockResolvedValue({ ...vehiculoMock });
    expect((await service.actualizarEstado(vehiculoMock.id, { vehicleStatus: EstadoVehiculo.EN_SERVICIO }, 'u1', '127.0.0.1')).esAsignable).toBe(false);
    await expect(service.actualizarEstado(vehiculoMock.id, { vehicleStatus: EstadoVehiculo.FUERA_DE_SERVICIO }, 'u1', '')).rejects.toThrow(BadRequestException);
    expect((await service.actualizarEstado(vehiculoMock.id, { vehicleStatus: EstadoVehiculo.FUERA_DE_SERVICIO, reason: 'Falla de frenos traseros' }, 'u1', '')).estado).toBe(EstadoVehiculo.FUERA_DE_SERVICIO);
    vehiculoRepoMock.findOne.mockResolvedValueOnce({ ...vehiculoMock, estado: EstadoVehiculo.FUERA_DE_SERVICIO });
    await expect(service.actualizarEstado(vehiculoMock.id, { vehicleStatus: EstadoVehiculo.DISPONIBLE }, 'u1', '')).rejects.toThrow(ConflictException);
    vehiculoRepoMock.findOne.mockResolvedValueOnce(null);
    await expect(service.actualizarEstado('missing', { vehicleStatus: EstadoVehiculo.MANTENIMIENTO }, 'u1', '')).rejects.toThrow(NotFoundException);
  });
});
