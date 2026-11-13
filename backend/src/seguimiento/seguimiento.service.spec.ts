import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { EntityManager, Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import {
  Asignacion,
  EstadoAsignacion,
} from '../asignaciones/entidades/asignacion.entity';
import { ConsultarPosicionesDto } from './dto/consultar-posiciones.dto';
import { CrearPosicionVehiculoDto } from './dto/crear-posicion-vehiculo.dto';
import { PosicionVehiculo } from './entidades/posicion-vehiculo.entity';
import { SeguimientoService } from './seguimiento.service';

const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
const REQUEST_IP = '192.0.2.10';
const ASSIGNMENT_ID = 'c0a80101-0000-4000-8000-000000000001';
const USER_DATA_ID = 'c0a80101-0000-4000-8000-000000000002';
const POINT = { type: 'Point', coordinates: [-76.532, 3.451] };

function createManager(repositories: Map<Function, object>) {
  return {
    getRepository: jest.fn((entity: Function) => repositories.get(entity)),
  };
}

function createAuditContext(manager: object) {
  return {
    ejecutar: jest.fn(
      async (
        _actorId: string,
        _requestIp: string,
        operation: (transactionManager: EntityManager) => Promise<unknown>,
      ) => operation(manager as unknown as EntityManager),
    ),
  };
}

function createService(
  positionRepository: object = {},
  assignmentRepository: object = {},
  auditContext: object = {},
): SeguimientoService {
  return new SeguimientoService(
    positionRepository as unknown as Repository<PosicionVehiculo>,
    assignmentRepository as unknown as Repository<Asignacion>,
    auditContext as unknown as ContextoAuditoriaService,
  );
}

function createAssignment(
  overrides: {
    id?: string;
    userDataId?: string;
    driverActive?: boolean;
    status?: EstadoAsignacion;
  } = {},
) {
  return {
    id: overrides.id ?? ASSIGNMENT_ID,
    estado: overrides.status ?? EstadoAsignacion.EN_PROGRESO,
    conductor: {
      activo: overrides.driverActive ?? true,
      datosUsuario: { id: overrides.userDataId ?? USER_DATA_ID },
    },
  };
}

describe('SeguimientoService', () => {
  describe('listar', () => {
    it('checks assignment access and returns paginated positions in reverse chronological order', async () => {
      const positions = [{ id: 'position-id', geometria: POINT }];
      const assignmentRepository = {
        findOne: jest.fn().mockResolvedValue(createAssignment()),
      };
      const positionRepository = {
        findAndCount: jest.fn().mockResolvedValue([positions, 12]),
      };
      const service = createService(positionRepository, assignmentRepository);
      const dto: ConsultarPosicionesDto = { page: 2, limit: 5 };

      await expect(
        service.listar(ASSIGNMENT_ID, dto, USER_DATA_ID),
      ).resolves.toEqual({
        items: positions,
        total: 12,
        page: 2,
        limit: 5,
      });

      expect(assignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: ASSIGNMENT_ID },
        relations: { conductor: { datosUsuario: true } },
      });
      expect(positionRepository.findAndCount).toHaveBeenCalledWith({
        where: { asignacion: { id: ASSIGNMENT_ID } },
        order: { registradoEn: 'DESC' },
        skip: 5,
        take: 5,
      });
    });

    it('throws NotFoundException when the assignment does not exist', async () => {
      const assignmentRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const positionRepository = { findAndCount: jest.fn() };
      const service = createService(positionRepository, assignmentRepository);

      await expect(
        service.listar(ASSIGNMENT_ID, { page: 1, limit: 20 }),
      ).rejects.toThrow(new NotFoundException('La asignación no existe.'));
      expect(positionRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('forbids users from listing another driver’s assignment positions', async () => {
      const assignmentRepository = {
        findOne: jest
          .fn()
          .mockResolvedValue(createAssignment({ userDataId: 'another-user' })),
      };
      const positionRepository = { findAndCount: jest.fn() };
      const service = createService(positionRepository, assignmentRepository);

      await expect(
        service.listar(ASSIGNMENT_ID, { page: 1, limit: 20 }, USER_DATA_ID),
      ).rejects.toThrow(
        new ForbiddenException(
          'Solo puede consultar posiciones de sus propias asignaciones.',
        ),
      );
      expect(positionRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('forbids an inactive driver from listing own assignment positions', async () => {
      const assignmentRepository = {
        findOne: jest
          .fn()
          .mockResolvedValue(createAssignment({ driverActive: false })),
      };
      const service = createService(
        { findAndCount: jest.fn() },
        assignmentRepository,
      );

      await expect(
        service.listar(ASSIGNMENT_ID, { page: 1, limit: 20 }, USER_DATA_ID),
      ).rejects.toThrow(new ForbiddenException('El conductor está inactivo.'));
    });
  });

  describe('crear', () => {
    const dto = {
      assignmentId: ASSIGNMENT_ID,
      geometry: POINT,
      recordedAt: new Date('2026-11-12T10:00:00.000Z'),
    } satisfies CrearPosicionVehiculoDto;

    it('validates the Point geometry before starting the audit transaction', async () => {
      const auditContext = { ejecutar: jest.fn() };
      const service = createService({}, {}, auditContext);

      await expect(
        service.crear(
          { ...dto, geometry: { type: 'Point', coordinates: [-76.5, 3.4, 8] } },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'geometry debe ser un GeoJSON Point con posiciones 2D.',
        ),
      );
      expect(auditContext.ejecutar).not.toHaveBeenCalled();
    });

    it('creates a position for an assignment transactionally', async () => {
      const assignment = createAssignment();
      const assignmentRepository = {
        findOne: jest.fn().mockResolvedValue(assignment),
      };
      const savedPosition = {
        id: 'position-id',
        asignacion: assignment,
        geometria: POINT,
        registradoEn: dto.recordedAt,
      };
      const positionRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue(savedPosition),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Asignacion, assignmentRepository],
          [PosicionVehiculo, positionRepository],
        ]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).resolves.toBe(
        savedPosition,
      );

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(assignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: ASSIGNMENT_ID },
        relations: { conductor: { datosUsuario: true } },
      });
      expect(positionRepository.create).toHaveBeenCalledWith({
        asignacion: assignment,
        geometria: POINT,
        registradoEn: dto.recordedAt,
      });
    });

    it('throws NotFoundException when the assignment does not exist', async () => {
      const assignmentRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const positionRepository = { create: jest.fn(), save: jest.fn() };
      const manager = createManager(
        new Map<Function, object>([
          [Asignacion, assignmentRepository],
          [PosicionVehiculo, positionRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
        new NotFoundException('La asignación no existe.'),
      );
      expect(positionRepository.save).not.toHaveBeenCalled();
    });

    it('rejects positions when the assignment is not in progress', async () => {
      const assignmentRepository = {
        findOne: jest
          .fn()
          .mockResolvedValue(
            createAssignment({ status: EstadoAsignacion.PROGRAMADA }),
          ),
      };
      const positionRepository = { create: jest.fn(), save: jest.fn() };
      const manager = createManager(
        new Map<Function, object>([
          [Asignacion, assignmentRepository],
          [PosicionVehiculo, positionRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
        new BadRequestException(
          'Solo se pueden registrar posiciones de asignaciones en curso.',
        ),
      );
      expect(positionRepository.save).not.toHaveBeenCalled();
    });

    it('forbids a driver from creating a position for another user’s assignment', async () => {
      const assignmentRepository = {
        findOne: jest
          .fn()
          .mockResolvedValue(createAssignment({ userDataId: 'another-user' })),
      };
      const positionRepository = { create: jest.fn(), save: jest.fn() };
      const manager = createManager(
        new Map<Function, object>([
          [Asignacion, assignmentRepository],
          [PosicionVehiculo, positionRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.crear(dto, ACTOR_ID, REQUEST_IP, USER_DATA_ID),
      ).rejects.toThrow(
        new ForbiddenException(
          'Solo puede registrar posiciones de sus propias asignaciones.',
        ),
      );
      expect(positionRepository.save).not.toHaveBeenCalled();
    });

    it('forbids an inactive driver from creating an own assignment position', async () => {
      const assignmentRepository = {
        findOne: jest
          .fn()
          .mockResolvedValue(createAssignment({ driverActive: false })),
      };
      const positionRepository = { create: jest.fn(), save: jest.fn() };
      const manager = createManager(
        new Map<Function, object>([
          [Asignacion, assignmentRepository],
          [PosicionVehiculo, positionRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.crear(dto, ACTOR_ID, REQUEST_IP, USER_DATA_ID),
      ).rejects.toThrow(new ForbiddenException('El conductor está inactivo.'));
      expect(positionRepository.save).not.toHaveBeenCalled();
    });
  });
});
