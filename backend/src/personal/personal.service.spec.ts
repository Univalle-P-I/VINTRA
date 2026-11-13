import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';

import {
  createAuditContext,
  createManager,
} from '../../test/helpers/audit-mocks';
import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Cuadrilla } from '../cuadrillas/entidades/cuadrilla.entity';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import type { CrearUsuarioInternoDto } from '../usuarios/dto/crear-usuario-interno.dto';
import { DatosUsuario } from '../usuarios/entidades/datos-usuario.entity';
import { TipoDocumento } from '../usuarios/entidades/cuenta-usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import type { ActualizarConductorDto } from './dto/actualizar-conductor.dto';
import type { CrearConductorDto } from './dto/crear-conductor.dto';
import { Conductor } from './entidades/conductor.entity';
import { PersonalService } from './personal.service';

const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
const REQUEST_IP = '192.0.2.10';
const USER_DATA_ID = 'c0a80101-0000-4000-8000-000000000001';
const DRIVER_ID = 'c0a80101-0000-4000-8000-000000000002';
const CREW_ID = 'c0a80101-0000-4000-8000-000000000003';

function createService(
  conductorRepository: object = {},
  usuariosService: object = {},
  contextoAuditoria: object = {},
): PersonalService {
  return new PersonalService(
    conductorRepository as unknown as Repository<Conductor>,
    usuariosService as unknown as UsuariosService,
    contextoAuditoria as unknown as ContextoAuditoriaService,
  );
}

function createData(overrides: Partial<DatosUsuario> = {}) {
  return {
    id: USER_DATA_ID,
    nombres: 'Ana',
    apellidos: 'Pérez',
    correo: 'ana@example.com',
    telefono: '3001234567',
    ...overrides,
  };
}

function createDriver(
  data: ReturnType<typeof createData>,
  crew: { id: string } | null = null,
) {
  return {
    id: DRIVER_ID,
    datosUsuario: data,
    cuadrilla: crew,
    inicioVinculacion: new Date('2026-01-01T00:00:00.000Z'),
    finVinculacion: null,
    activo: true,
  };
}

describe('PersonalService', () => {
  describe('listar', () => {
    it('lists drivers with user and crew relations and maps the public response', async () => {
      const data = createData();
      const crew = { id: CREW_ID };
      const driver = createDriver(data, crew);
      const conductorRepository = {
        find: jest.fn().mockResolvedValue([driver]),
      };
      const service = createService(conductorRepository);

      await expect(service.listar()).resolves.toEqual([
        {
          id: DRIVER_ID,
          userDataId: USER_DATA_ID,
          crewId: CREW_ID,
          firstName: 'Ana',
          lastName: 'Pérez',
          email: 'ana@example.com',
          phone: '3001234567',
          startedAt: driver.inicioVinculacion,
          endedAt: null,
          isActive: true,
        },
      ]);

      expect(conductorRepository.find).toHaveBeenCalledWith({
        relations: { datosUsuario: true, cuadrilla: true },
        order: { inicioVinculacion: 'DESC' },
      });
    });
  });

  describe('obtener', () => {
    it('returns the requested driver with its public user and crew data', async () => {
      const data = createData({ telefono: null });
      const driver = createDriver(data);
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(driver),
      };
      const service = createService(conductorRepository);

      await expect(service.obtener(DRIVER_ID)).resolves.toEqual({
        id: DRIVER_ID,
        userDataId: USER_DATA_ID,
        crewId: null,
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: null,
        startedAt: driver.inicioVinculacion,
        endedAt: null,
        isActive: true,
      });

      expect(conductorRepository.findOne).toHaveBeenCalledWith({
        where: { id: DRIVER_ID },
        relations: { datosUsuario: true, cuadrilla: true },
      });
    });

    it('throws NotFoundException when the driver does not exist', async () => {
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const service = createService(conductorRepository);

      await expect(service.obtener(DRIVER_ID)).rejects.toThrow(
        new NotFoundException('El conductor no existe.'),
      );
      expect(conductorRepository.findOne).toHaveBeenCalledWith({
        where: { id: DRIVER_ID },
        relations: { datosUsuario: true, cuadrilla: true },
      });
    });
  });

  describe('obtenerPropio', () => {
    it('loads the conductor by the authenticated user data ID', async () => {
      const driver = createDriver(createData());
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(driver),
      };
      const service = createService(conductorRepository);

      await expect(service.obtenerPropio(USER_DATA_ID)).resolves.toMatchObject({
        id: DRIVER_ID,
        userDataId: USER_DATA_ID,
      });

      expect(conductorRepository.findOne).toHaveBeenCalledWith({
        where: { datosUsuario: { id: USER_DATA_ID } },
        relations: { datosUsuario: true, cuadrilla: true },
      });
    });

    it('throws NotFoundException when the authenticated user has no driver record', async () => {
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const service = createService(conductorRepository);

      await expect(service.obtenerPropio(USER_DATA_ID)).rejects.toThrow(
        new NotFoundException('El conductor no existe.'),
      );
    });
  });

  describe('crear', () => {
    const dto = {
      documentType: TipoDocumento.CC,
      documentId: '1234567890',
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      phone: '3001234567',
      password: 'a-secure-password',
      crewId: CREW_ID,
    } satisfies CrearConductorDto;

    it('creates a driver, delegates user creation, and attaches an active crew transactionally', async () => {
      const crew = { id: CREW_ID, activo: true };
      const data = createData();
      const driver = createDriver(data, crew);
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(crew),
      };
      const conductorRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue(driver),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Cuadrilla, crewRepository],
          [Conductor, conductorRepository],
        ]),
      );
      const usuariosService = {
        crearEntidades: jest.fn().mockResolvedValue({
          account: {},
          data,
          role: RolUsuario.DRIVER,
        }),
      };
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, usuariosService, contextoAuditoria);
      const expectedUserDto: CrearUsuarioInternoDto = {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        documentType: dto.documentType,
        documentId: dto.documentId,
        role: RolUsuario.DRIVER,
        password: dto.password,
      };

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).resolves.toEqual({
        id: DRIVER_ID,
        userDataId: USER_DATA_ID,
        crewId: CREW_ID,
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: '3001234567',
        startedAt: driver.inicioVinculacion,
        endedAt: null,
        isActive: true,
      });

      expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: CREW_ID, activo: true },
      });
      expect(usuariosService.crearEntidades).toHaveBeenCalledWith(
        expect.anything(),
        expectedUserDto,
      );
      expect(manager.getRepository).toHaveBeenNthCalledWith(1, Cuadrilla);
      expect(manager.getRepository).toHaveBeenNthCalledWith(2, Conductor);
      expect(conductorRepository.create).toHaveBeenCalledWith({
        datosUsuario: data,
        cuadrilla: crew,
        activo: true,
        finVinculacion: null,
      });
      expect(conductorRepository.save).toHaveBeenCalledWith({
        datosUsuario: data,
        cuadrilla: crew,
        activo: true,
        finVinculacion: null,
      });
    });

    it('creates a driver without querying a crew when crewId is omitted', async () => {
      const data = createData();
      const driver = createDriver(data);
      const conductorRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue(driver),
      };
      const manager = createManager(
        new Map<Function, object>([[Conductor, conductorRepository]]),
      );
      const usuariosService = {
        crearEntidades: jest.fn().mockResolvedValue({
          account: {},
          data,
          role: RolUsuario.DRIVER,
        }),
      };
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, usuariosService, contextoAuditoria);
      const dtoWithoutCrew = { ...dto, crewId: undefined };

      await expect(
        service.crear(dtoWithoutCrew, ACTOR_ID, REQUEST_IP),
      ).resolves.toMatchObject({ crewId: null, userDataId: USER_DATA_ID });

      expect(manager.getRepository).toHaveBeenCalledTimes(1);
      expect(manager.getRepository).toHaveBeenCalledWith(Conductor);
      expect(conductorRepository.create).toHaveBeenCalledWith({
        datosUsuario: data,
        cuadrilla: null,
        activo: true,
        finVinculacion: null,
      });
    });

    it('rejects a missing or inactive crew before creating the user', async () => {
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const conductorRepository = {
        create: jest.fn(),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Cuadrilla, crewRepository],
          [Conductor, conductorRepository],
        ]),
      );
      const usuariosService = {
        crearEntidades: jest.fn(),
      };
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, usuariosService, contextoAuditoria);

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
        new NotFoundException('La cuadrilla no existe o está inactiva.'),
      );

      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: CREW_ID, activo: true },
      });
      expect(usuariosService.crearEntidades).not.toHaveBeenCalled();
      expect(conductorRepository.save).not.toHaveBeenCalled();
    });

    it('translates a PostgreSQL unique violation to ConflictException', async () => {
      const manager = createManager(new Map<Function, object>());
      const usuariosService = {
        crearEntidades: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, usuariosService, contextoAuditoria);
      const dtoWithoutCrew = { ...dto, crewId: undefined };

      await expect(
        service.crear(dtoWithoutCrew, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(
        new ConflictException(
          'El correo o documento ya está asociado a otro usuario.',
        ),
      );

      expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
    });
  });

  describe('actualizar', () => {
    it('updates supplied fields, preserves omitted values, and unassigns a nullable crew', async () => {
      const data = createData();
      const crew = { id: CREW_ID };
      const driver = createDriver(data, crew);
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(driver),
        save: jest.fn(async (value) => value),
      };
      const datosRepository = {
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Conductor, conductorRepository],
          [DatosUsuario, datosRepository],
        ]),
      );
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, {}, contextoAuditoria);
      const dto: ActualizarConductorDto = {
        firstName: 'Ana María',
        phone: null,
        crewId: null,
        isActive: false,
      };

      await expect(
        service.actualizar(DRIVER_ID, dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: DRIVER_ID,
        userDataId: USER_DATA_ID,
        crewId: null,
        firstName: 'Ana María',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: null,
        startedAt: driver.inicioVinculacion,
        endedAt: null,
        isActive: false,
      });

      expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(conductorRepository.findOne).toHaveBeenCalledWith({
        where: { id: DRIVER_ID },
        relations: { datosUsuario: true, cuadrilla: true },
      });
      expect(datosRepository.save).toHaveBeenCalledWith(data);
      expect(conductorRepository.save).toHaveBeenCalledWith(driver);
      expect(manager.getRepository).toHaveBeenNthCalledWith(1, Conductor);
      expect(manager.getRepository).toHaveBeenNthCalledWith(2, DatosUsuario);
    });

    it('assigns a replacement crew only when it is active', async () => {
      const data = createData();
      const replacementCrew = { id: 'replacement-crew-id', activo: true };
      const driver = createDriver(data);
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(replacementCrew),
      };
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(driver),
        save: jest.fn(async (value) => value),
      };
      const datosRepository = {
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Conductor, conductorRepository],
          [Cuadrilla, crewRepository],
          [DatosUsuario, datosRepository],
        ]),
      );
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, {}, contextoAuditoria);

      await expect(
        service.actualizar(
          DRIVER_ID,
          { crewId: replacementCrew.id },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).resolves.toMatchObject({ crewId: replacementCrew.id });

      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: replacementCrew.id, activo: true },
      });
      expect(conductorRepository.save).toHaveBeenCalledWith(driver);
    });

    it('throws NotFoundException when the driver does not exist', async () => {
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[Conductor, conductorRepository]]),
      );
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, {}, contextoAuditoria);

      await expect(
        service.actualizar(DRIVER_ID, {}, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(new NotFoundException('El conductor no existe.'));

      expect(conductorRepository.findOne).toHaveBeenCalledWith({
        where: { id: DRIVER_ID },
        relations: { datosUsuario: true, cuadrilla: true },
      });
      expect(conductorRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a missing or inactive replacement crew without saving either entity', async () => {
      const data = createData();
      const driver = createDriver(data);
      const crewRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(driver),
        save: jest.fn(),
      };
      const datosRepository = {
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Conductor, conductorRepository],
          [Cuadrilla, crewRepository],
          [DatosUsuario, datosRepository],
        ]),
      );
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, {}, contextoAuditoria);

      await expect(
        service.actualizar(
          DRIVER_ID,
          { crewId: 'inactive-crew-id' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new NotFoundException('La cuadrilla no existe o está inactiva.'),
      );

      expect(crewRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'inactive-crew-id', activo: true },
      });
      expect(datosRepository.save).not.toHaveBeenCalled();
      expect(conductorRepository.save).not.toHaveBeenCalled();
    });

    it('translates PostgreSQL unique violations from user data to ConflictException', async () => {
      const data = createData({ correo: 'new@example.com' });
      const driver = createDriver(data);
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue(driver),
        save: jest.fn(),
      };
      const datosRepository = {
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Conductor, conductorRepository],
          [DatosUsuario, datosRepository],
        ]),
      );
      const contextoAuditoria = createAuditContext(manager);
      const service = createService({}, {}, contextoAuditoria);

      await expect(
        service.actualizar(
          DRIVER_ID,
          { email: 'new@example.com' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new ConflictException(
          'El correo o documento ya está asociado a otro usuario.',
        ),
      );

      expect(datosRepository.save).toHaveBeenCalledWith(data);
      expect(conductorRepository.save).not.toHaveBeenCalled();
    });
  });
});
