import { Test, TestingModule } from '@nestjs/testing';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { roles } from '../common/enums/roles.enum';
import { EstadoVehiculo } from './entidades/vehiculo.entity';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';

describe('VehiculosController', () => {
  let controller: VehiculosController;

  const serviceMock = {
    listarTipos: jest.fn(),
    crearTipo: jest.fn(),
    actualizarTipo: jest.fn(),
    listarEstados: jest.fn(),
    listar: jest.fn(),
    obtener: jest.fn(),
    crear: jest.fn(),
    actualizarEstado: jest.fn(),
    actualizar: jest.fn(),
  };

  const actor: AuthenticatedUser = {
    id: 'admin-id',
    email: 'admin@vintra.local',
    roles: [roles.ADMIN],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculosController],
      providers: [{ provide: VehiculosService, useValue: serviceMock }],
    }).compile();

    controller = module.get<VehiculosController>(VehiculosController);
  });

  it('delega todas las rutas del controlador al servicio', async () => {
    serviceMock.listarTipos.mockResolvedValue([]);
    serviceMock.crearTipo.mockResolvedValue({ id: 't1' });
    serviceMock.actualizarTipo.mockResolvedValue({ id: 't1' });
    serviceMock.listarEstados.mockReturnValue([]);
    serviceMock.listar.mockResolvedValue([]);
    serviceMock.obtener.mockResolvedValue({ id: 'v1' });
    serviceMock.crear.mockResolvedValue({ id: 'v1' });
    serviceMock.actualizarEstado.mockResolvedValue({ id: 'v1' });
    serviceMock.actualizar.mockResolvedValue({ id: 'v1' });

    await expect(controller.listarTipos()).resolves.toEqual([]);
    await expect(
      controller.crearTipo({ code: 'COMP', name: 'Compactador' }, actor, '127.0.0.1'),
    ).resolves.toEqual({ id: 't1' });
    await expect(
      controller.actualizarTipo('t1', { name: 'Nuevo' }, actor, '127.0.0.1'),
    ).resolves.toEqual({ id: 't1' });
    expect(controller.listarEstados()).toEqual([]);
    await expect(
      controller.listar({ status: EstadoVehiculo.DISPONIBLE }),
    ).resolves.toEqual([]);
    await expect(controller.obtener('v1')).resolves.toEqual({ id: 'v1' });
    await expect(
      controller.crear(
        {
          vehicleTypeId: 't1',
          vehicleStatus: EstadoVehiculo.DISPONIBLE,
          plate: 'ABC123',
          capacityKg: '5000',
          capacityYd3: '12',
        },
        actor,
        '127.0.0.1',
      ),
    ).resolves.toEqual({ id: 'v1' });
    await expect(
      controller.actualizarEstado(
        'v1',
        { vehicleStatus: EstadoVehiculo.EN_SERVICIO },
        actor,
        '127.0.0.1',
      ),
    ).resolves.toEqual({ id: 'v1' });
    await expect(
      controller.actualizar('v1', { plate: 'XYZ999' }, actor, '127.0.0.1'),
    ).resolves.toEqual({ id: 'v1' });
  });
});
