import type { EntityManager, Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { TipoVehiculo } from './entidades/tipo-vehiculo.entity';
import { EstadoVehiculo, Vehiculo } from './entidades/vehiculo.entity';
import { VehiculosService } from './vehiculos.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('VehiculosService', () => {
  describe('listarTipos', () => {
    it('debe listar únicamente los tipos de vehículos activos', async () => {
      const tipos = [
        { id: '1', codigo: 'CAM', nombre: 'Camión', activo: true },
        { id: '2', codigo: 'VOL', nombre: 'Volqueta', activo: true },
      ];

      const tipoRepository = {
        find: jest.fn().mockResolvedValue(tipos),
      };

      const service = new VehiculosService(
        tipoRepository as unknown as Repository<TipoVehiculo>,
        {} as Repository<Vehiculo>,
        {} as ContextoAuditoriaService,
      );

      await expect(service.listarTipos()).resolves.toEqual(tipos);

      expect(tipoRepository.find).toHaveBeenCalledWith({
        where: { activo: true },
        order: { nombre: 'ASC' },
      });
    });
  });

  const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
  const REQUEST_IP = '192.0.2.10';

  function createHarness(tipoRepository: object, vehiculoRepository: object) {
    const manager = {
      getRepository: jest.fn((entity: Function) => {
        if (entity === TipoVehiculo) return tipoRepository;
        if (entity === Vehiculo) return vehiculoRepository;
        return undefined;
      }),
    };
    const contextoAuditoria = {
      ejecutar: jest.fn(
        async (
          _actorId: string,
          _requestIp: string,
          operation: (transactionManager: EntityManager) => Promise<unknown>,
        ) => operation(manager as unknown as EntityManager),
      ),
    };
    const service = new VehiculosService(
      tipoRepository as unknown as Repository<TipoVehiculo>,
      vehiculoRepository as unknown as Repository<Vehiculo>,
      contextoAuditoria as unknown as ContextoAuditoriaService,
    );

    return { service, manager, contextoAuditoria };
  }

  describe('VehiculosService additional coverage', () => {
    describe('crearTipo', () => {
      it('defaults the new type to active when isActive is omitted', async () => {
        const tipoRepository = {
          create: jest.fn((value) => value),
          save: jest.fn(async (value) => value),
        };
        const { service, manager, contextoAuditoria } = createHarness(
          tipoRepository,
          {},
        );

        await expect(
          service.crearTipo(
            { code: 'VOL', name: 'Volqueta' },
            ACTOR_ID,
            REQUEST_IP,
          ),
        ).resolves.toEqual({
          codigo: 'VOL',
          nombre: 'Volqueta',
          activo: true,
        });

        expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
          ACTOR_ID,
          REQUEST_IP,
          expect.any(Function),
        );
        expect(manager.getRepository).toHaveBeenCalledWith(TipoVehiculo);
        expect(tipoRepository.create).toHaveBeenCalledWith({
          codigo: 'VOL',
          nombre: 'Volqueta',
          activo: true,
        });
      });

      describe('actualizarTipo', () => {
        it('updates only supplied fields and keeps the remaining type values', async () => {
          const type = {
            id: 'type-id',
            codigo: 'CAM',
            nombre: 'Camión',
            activo: true,
          };
          const tipoRepository = {
            findOneBy: jest.fn().mockResolvedValue(type),
            save: jest.fn(async (value) => value),
          };
          const { service, manager, contextoAuditoria } = createHarness(
            tipoRepository,
            {},
          );

          await expect(
            service.actualizarTipo(
              'type-id',
              { name: 'Camión recolector' },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).resolves.toEqual({
            id: 'type-id',
            codigo: 'CAM',
            nombre: 'Camión recolector',
            activo: true,
          });

          expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
            ACTOR_ID,
            REQUEST_IP,
            expect.any(Function),
          );
          expect(manager.getRepository).toHaveBeenCalledWith(TipoVehiculo);
          expect(tipoRepository.findOneBy).toHaveBeenCalledWith({
            id: 'type-id',
          });
          expect(tipoRepository.save).toHaveBeenCalledWith(type);
        });

        it('throws NotFoundException when the type does not exist', async () => {
          const tipoRepository = {
            findOneBy: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
          };
          const { service } = createHarness(tipoRepository, {});

          await expect(
            service.actualizarTipo('missing-id', {}, ACTOR_ID, REQUEST_IP),
          ).rejects.toThrow(
            new NotFoundException('El tipo de vehículo no existe.'),
          );

          expect(tipoRepository.findOneBy).toHaveBeenCalledWith({
            id: 'missing-id',
          });
          expect(tipoRepository.save).not.toHaveBeenCalled();
        });

        it('translates a duplicate code violation to ConflictException', async () => {
          const tipoRepository = {
            findOneBy: jest.fn().mockResolvedValue({
              id: 'type-id',
              codigo: 'CAM',
              nombre: 'Camión',
              activo: true,
            }),
            save: jest.fn().mockRejectedValue({ code: '23505' }),
          };
          const { service } = createHarness(tipoRepository, {});

          await expect(
            service.actualizarTipo(
              'type-id',
              { code: 'VOL' },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).rejects.toThrow(
            new ConflictException('Ya existe un tipo con ese código.'),
          );
        });
      });

      describe('crear', () => {
        const type = {
          id: 'type-id',
          codigo: 'CAM',
          nombre: 'Camión',
          activo: true,
        };

        it('creates a vehicle with its active type and default active state transactionally', async () => {
          const tipoRepository = {
            findOne: jest.fn().mockResolvedValue(type),
          };
          const vehicleRepository = {
            create: jest.fn((value) => value),
            save: jest.fn(async (value) => ({ id: 'vehicle-id', ...value })),
          };
          const { service, manager, contextoAuditoria } = createHarness(
            tipoRepository,
            vehicleRepository,
          );
          const dto = {
            vehicleTypeId: 'type-id',
            vehicleStatus: EstadoVehiculo.DISPONIBLE,
            plate: 'ABC123',
            capacityKg: '1200',
            capacityYd3: '8',
          };

          await expect(
            service.crear(dto, ACTOR_ID, REQUEST_IP),
          ).resolves.toEqual({
            id: 'vehicle-id',
            tipoVehiculo: type,
            estado: EstadoVehiculo.DISPONIBLE,
            placa: 'ABC123',
            capacidadKg: '1200',
            capacidadYd3: '8',
            activo: true,
          });

          expect(tipoRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'type-id', activo: true },
          });
          expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
            ACTOR_ID,
            REQUEST_IP,
            expect.any(Function),
          );
          expect(manager.getRepository).toHaveBeenCalledWith(Vehiculo);
          expect(vehicleRepository.create).toHaveBeenCalledWith({
            tipoVehiculo: type,
            estado: EstadoVehiculo.DISPONIBLE,
            placa: 'ABC123',
            capacidadKg: '1200',
            capacidadYd3: '8',
            activo: true,
          });
        });

        it('rejects a missing or inactive vehicle type before starting the transaction', async () => {
          const tipoRepository = {
            findOne: jest.fn().mockResolvedValue(null),
          };
          const vehicleRepository = {
            create: jest.fn(),
            save: jest.fn(),
          };
          const { service, contextoAuditoria } = createHarness(
            tipoRepository,
            vehicleRepository,
          );

          await expect(
            service.crear(
              {
                vehicleTypeId: 'type-id',
                vehicleStatus: EstadoVehiculo.DISPONIBLE,
                plate: 'ABC123',
                capacityKg: '1200',
                capacityYd3: '8',
              },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).rejects.toThrow(
            new NotFoundException(
              'El tipo de vehículo no existe o está inactivo.',
            ),
          );

          expect(tipoRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'type-id', activo: true },
          });
          expect(contextoAuditoria.ejecutar).not.toHaveBeenCalled();
          expect(vehicleRepository.save).not.toHaveBeenCalled();
        });

        it('translates a duplicate plate violation to ConflictException', async () => {
          const tipoRepository = {
            findOne: jest.fn().mockResolvedValue(type),
          };
          const vehicleRepository = {
            create: jest.fn((value) => value),
            save: jest.fn().mockRejectedValue({ code: '23505' }),
          };
          const { service } = createHarness(tipoRepository, vehicleRepository);

          await expect(
            service.crear(
              {
                vehicleTypeId: 'type-id',
                vehicleStatus: EstadoVehiculo.DISPONIBLE,
                plate: 'ABC123',
                capacityKg: '1200',
                capacityYd3: '8',
              },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).rejects.toThrow(
            new ConflictException('Ya existe un vehículo con esa placa.'),
          );

          expect(tipoRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'type-id', activo: true },
          });
        });
      });

      describe('actualizar', () => {
        it('applies a partial update without changing omitted values or looking up a type', async () => {
          const type = { id: 'type-id', nombre: 'Camión' };
          const vehicle = {
            id: 'vehicle-id',
            tipoVehiculo: type,
            estado: EstadoVehiculo.DISPONIBLE,
            placa: 'ABC123',
            capacidadKg: '1200',
            capacidadYd3: '8',
            activo: true,
          };
          const tipoRepository = { findOne: jest.fn() };
          const vehicleRepository = {
            findOne: jest.fn().mockResolvedValue(vehicle),
            save: jest.fn(async (value) => value),
          };
          const { service, manager, contextoAuditoria } = createHarness(
            tipoRepository,
            vehicleRepository,
          );

          await expect(
            service.actualizar(
              'vehicle-id',
              { plate: 'XYZ789' },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).resolves.toEqual({
            id: 'vehicle-id',
            tipoVehiculo: type,
            estado: EstadoVehiculo.DISPONIBLE,
            placa: 'XYZ789',
            capacidadKg: '1200',
            capacidadYd3: '8',
            activo: true,
          });

          expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
            ACTOR_ID,
            REQUEST_IP,
            expect.any(Function),
          );
          expect(manager.getRepository).toHaveBeenCalledWith(Vehiculo);
          expect(vehicleRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'vehicle-id' },
            relations: { tipoVehiculo: true },
          });
          expect(vehicleRepository.save).toHaveBeenCalledWith(vehicle);
          expect(tipoRepository.findOne).not.toHaveBeenCalled();
        });

        it('throws NotFoundException when the vehicle does not exist', async () => {
          const vehicleRepository = {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
          };
          const { service } = createHarness({}, vehicleRepository);

          await expect(
            service.actualizar(
              'missing-id',
              { plate: 'XYZ789' },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).rejects.toThrow(new NotFoundException('El vehículo no existe.'));

          expect(vehicleRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'missing-id' },
            relations: { tipoVehiculo: true },
          });
          expect(vehicleRepository.save).not.toHaveBeenCalled();
        });

        it('rejects a missing or inactive replacement type', async () => {
          const vehicle = {
            id: 'vehicle-id',
            tipoVehiculo: { id: 'old-type-id' },
            estado: EstadoVehiculo.DISPONIBLE,
            placa: 'ABC123',
            capacidadKg: '1200',
            capacidadYd3: '8',
            activo: true,
          };
          const tipoRepository = {
            findOne: jest.fn().mockResolvedValue(null),
          };
          const vehicleRepository = {
            findOne: jest.fn().mockResolvedValue(vehicle),
            save: jest.fn(),
          };
          const { service, manager } = createHarness(
            tipoRepository,
            vehicleRepository,
          );

          await expect(
            service.actualizar(
              'vehicle-id',
              { vehicleTypeId: 'inactive-type-id' },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).rejects.toThrow(
            new NotFoundException(
              'El tipo de vehículo no existe o está inactivo.',
            ),
          );

          expect(manager.getRepository).toHaveBeenNthCalledWith(1, Vehiculo);
          expect(manager.getRepository).toHaveBeenNthCalledWith(
            2,
            TipoVehiculo,
          );
          expect(tipoRepository.findOne).toHaveBeenCalledWith({
            where: { id: 'inactive-type-id', activo: true },
          });
          expect(vehicleRepository.save).not.toHaveBeenCalled();
        });

        it('translates a duplicate plate violation to ConflictException', async () => {
          const vehicle = {
            id: 'vehicle-id',
            tipoVehiculo: { id: 'type-id' },
            estado: EstadoVehiculo.DISPONIBLE,
            placa: 'ABC123',
            capacidadKg: '1200',
            capacidadYd3: '8',
            activo: true,
          };
          const vehicleRepository = {
            findOne: jest.fn().mockResolvedValue(vehicle),
            save: jest.fn().mockRejectedValue({ code: '23505' }),
          };
          const { service } = createHarness({}, vehicleRepository);

          await expect(
            service.actualizar(
              'vehicle-id',
              { plate: 'XYZ789' },
              ACTOR_ID,
              REQUEST_IP,
            ),
          ).rejects.toThrow(
            new ConflictException('Ya existe un vehículo con esa placa.'),
          );
        });
      });
    });
  });

  describe('crearTipo', () => {
    it('debe crear un tipo de vehículo dentro de una transacción', async () => {
      const dto = {
        code: 'CAM',
        name: 'Camión',
        isActive: true,
      };

      const actorId = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
      const requestIp = '192.0.2.10';

      const tipoCreado = {
        id: '10',
        codigo: 'CAM',
        nombre: 'Camión',
        activo: true,
      };

      const tipoRepository = {
        create: jest.fn().mockReturnValue(tipoCreado),
        save: jest.fn().mockResolvedValue(tipoCreado),
      };

      const manager = {
        getRepository: jest.fn().mockReturnValue(tipoRepository),
      };

      const contextoAuditoria = {
        ejecutar: jest.fn(
          async (
            _actorId: string,
            _requestIp: string,
            operation: (transactionManager: EntityManager) => Promise<unknown>,
          ) => operation(manager as unknown as EntityManager),
        ),
      };

      const service = new VehiculosService(
        {} as Repository<TipoVehiculo>,
        {} as Repository<Vehiculo>,
        contextoAuditoria as unknown as ContextoAuditoriaService,
      );

      await expect(service.crearTipo(dto, actorId, requestIp)).resolves.toEqual(
        tipoCreado,
      );

      expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
        actorId,
        requestIp,
        expect.any(Function),
      );

      expect(manager.getRepository).toHaveBeenCalledWith(TipoVehiculo);

      expect(tipoRepository.create).toHaveBeenCalledWith({
        codigo: 'CAM',
        nombre: 'Camión',
        activo: true,
      });

      expect(tipoRepository.save).toHaveBeenCalledWith(tipoCreado);
    });
  });

  it('debe lanzar ConflictException cuando el código del tipo ya existe', async () => {
    const dto = {
      code: 'CAM',
      name: 'Camión',
      isActive: true,
    };

    const manager = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn().mockReturnValue(dto),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      }),
    };

    const contextoAuditoria = {
      ejecutar: jest.fn(
        async (
          _actorId: string,
          _requestIp: string,
          operation: (transactionManager: EntityManager) => Promise<unknown>,
        ) => operation(manager as unknown as EntityManager),
      ),
    };

    const service = new VehiculosService(
      {} as Repository<TipoVehiculo>,
      {} as Repository<Vehiculo>,
      contextoAuditoria as unknown as ContextoAuditoriaService,
    );

    await expect(
      service.crearTipo(
        dto,
        'f0836911-5b63-490c-88a2-9176b9b2b4a1',
        '192.0.2.10',
      ),
    ).rejects.toThrow('Ya existe un tipo con ese código.');
  });

  describe('listar', () => {
    it('debe listar únicamente los vehículos activos con su tipo asociado', async () => {
      const vehiculos = [
        {
          id: '1',
          placa: 'ABC123',
          activo: true,
          tipoVehiculo: {
            id: '10',
            nombre: 'Camión',
          },
        },
      ];

      const vehiculoRepository = {
        find: jest.fn().mockResolvedValue(vehiculos),
      };

      const service = new VehiculosService(
        {} as Repository<TipoVehiculo>,
        vehiculoRepository as unknown as Repository<Vehiculo>,
        {} as ContextoAuditoriaService,
      );

      await expect(service.listar()).resolves.toEqual(vehiculos);

      expect(vehiculoRepository.find).toHaveBeenCalledWith({
        where: { activo: true },
        relations: { tipoVehiculo: true },
        order: { placa: 'ASC' },
      });
    });
  });

  describe('obtener', () => {
    it('debe devolver un vehículo cuando existe', async () => {
      const vehiculo = {
        id: '1',
        placa: 'ABC123',
        activo: true,
        tipoVehiculo: {
          id: '10',
          nombre: 'Camión',
        },
      };

      const vehiculoRepository = {
        findOne: jest.fn().mockResolvedValue(vehiculo),
      };

      const service = new VehiculosService(
        {} as Repository<TipoVehiculo>,
        vehiculoRepository as unknown as Repository<Vehiculo>,
        {} as ContextoAuditoriaService,
      );

      await expect(service.obtener('1')).resolves.toEqual(vehiculo);

      expect(vehiculoRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: { tipoVehiculo: true },
      });
    });

    it('debe lanzar NotFoundException cuando el vehículo no existe', async () => {
      const vehiculoRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const service = new VehiculosService(
        {} as Repository<TipoVehiculo>,
        vehiculoRepository as unknown as Repository<Vehiculo>,
        {} as ContextoAuditoriaService,
      );

      await expect(service.obtener('999')).rejects.toThrow(
        'El vehículo no existe.',
      );

      expect(vehiculoRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
        relations: { tipoVehiculo: true },
      });
    });
  });
});
