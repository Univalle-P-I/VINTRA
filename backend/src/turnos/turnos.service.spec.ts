import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { EntityManager, Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Microruta } from '../rutas/entidades/microruta.entity';
import { ActualizarHorarioDto } from './dto/actualizar-horario.dto';
import { ActualizarMicrorutaHorarioDto } from './dto/actualizar-microruta-horario.dto';
import { CrearHorarioDto } from './dto/crear-horario.dto';
import { CrearMicrorutaHorarioDto } from './dto/crear-microruta-horario.dto';
import { Horario } from './entidades/horario.entity';
import { MicrorutaHorario } from './entidades/microruta-horario.entity';
import { TurnosService } from './turnos.service';

const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
const REQUEST_IP = '192.0.2.10';
const SCHEDULE_ID = 'c0a80101-0000-4000-8000-000000000001';
const ROUTE_ID = 'c0a80101-0000-4000-8000-000000000002';
const LINK_ID = 'c0a80101-0000-4000-8000-000000000003';

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
  horarioRepository: object = {},
  linkRepository: object = {},
  auditContext: object = {},
): TurnosService {
  return new TurnosService(
    horarioRepository as unknown as Repository<Horario>,
    linkRepository as unknown as Repository<MicrorutaHorario>,
    auditContext as unknown as ContextoAuditoriaService,
  );
}

describe('TurnosService', () => {
  describe('listar', () => {
    it('filters by active state and uses zero-based pagination defaults', async () => {
      const schedules = [{ id: SCHEDULE_ID, activo: false }];
      const horarioRepository = {
        findAndCount: jest.fn().mockResolvedValue([schedules, 4]),
      };
      const service = createService(horarioRepository);

      await expect(
        service.listar({ isActive: false, page: 2, size: 5 }),
      ).resolves.toEqual({
        items: schedules,
        total: 4,
        page: 2,
        size: 5,
      });

      expect(horarioRepository.findAndCount).toHaveBeenCalledWith({
        where: { activo: false },
        order: { horaInicio: 'ASC' },
        skip: 10,
        take: 5,
      });
    });

    it('defaults to all schedules, page zero, and page size 20', async () => {
      const horarioRepository = {
        findAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      const service = createService(horarioRepository);

      await expect(service.listar({})).resolves.toEqual({
        items: [],
        total: 0,
        page: 0,
        size: 20,
      });
      expect(horarioRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { horaInicio: 'ASC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('obtener', () => {
    it('returns a schedule by ID', async () => {
      const schedule = {
        id: SCHEDULE_ID,
        horaInicio: '08:00',
        horaFin: '10:00',
      };
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue(schedule),
      };
      const service = createService(horarioRepository);

      await expect(service.obtener(SCHEDULE_ID)).resolves.toBe(schedule);
      expect(horarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: SCHEDULE_ID },
      });
    });

    it('throws NotFoundException when the schedule does not exist', async () => {
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const service = createService(horarioRepository);

      await expect(service.obtener(SCHEDULE_ID)).rejects.toThrow(
        new NotFoundException('El horario no existe.'),
      );
    });
  });

  describe('crear', () => {
    it('creates an active schedule and stores a missing name as null', async () => {
      const horarioRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: SCHEDULE_ID, ...value })),
      };
      const manager = createManager(
        new Map<Function, object>([[Horario, horarioRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);
      const dto: CrearHorarioDto = {
        startTime: '08:00',
        endTime: '10:00',
      };

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).resolves.toEqual({
        id: SCHEDULE_ID,
        nombre: null,
        horaInicio: '08:00',
        horaFin: '10:00',
        activo: true,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(horarioRepository.create).toHaveBeenCalledWith({
        nombre: null,
        horaInicio: '08:00',
        horaFin: '10:00',
        activo: true,
      });
    });

    it.each([
      ['equal start and end', '08:00', '08:00'],
      ['end before start', '10:00', '08:00'],
    ])(
      'rejects a range with %s before starting the transaction',
      (_case, startTime, endTime) => {
        const auditContext = { ejecutar: jest.fn() };
        const service = createService({}, {}, auditContext);

        expect(() =>
          service.crear({ startTime, endTime }, ACTOR_ID, REQUEST_IP),
        ).toThrow(
          new BadRequestException(
            'La hora final debe ser posterior a la hora inicial.',
          ),
        );
        expect(auditContext.ejecutar).not.toHaveBeenCalled();
      },
    );
  });

  describe('actualizar', () => {
    it('updates supplied fields and preserves the existing start time', async () => {
      const schedule = {
        id: SCHEDULE_ID,
        nombre: 'Mañana',
        horaInicio: '08:00',
        horaFin: '10:00',
        activo: true,
      };
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue(schedule),
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([[Horario, horarioRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);
      const dto: ActualizarHorarioDto = {
        name: 'Turno mañana',
        endTime: '11:00',
        isActive: false,
      };

      await expect(
        service.actualizar(SCHEDULE_ID, dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: SCHEDULE_ID,
        nombre: 'Turno mañana',
        horaInicio: '08:00',
        horaFin: '11:00',
        activo: false,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(horarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: SCHEDULE_ID },
      });
      expect(horarioRepository.save).toHaveBeenCalledWith(schedule);
    });

    it('throws NotFoundException when the schedule does not exist', async () => {
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[Horario, horarioRepository]]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizar(
          SCHEDULE_ID,
          { name: 'Turno mañana' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(new NotFoundException('El horario no existe.'));
      expect(horarioRepository.save).not.toHaveBeenCalled();
    });

    it('validates the resulting range before saving', async () => {
      const schedule = {
        id: SCHEDULE_ID,
        nombre: 'Mañana',
        horaInicio: '08:00',
        horaFin: '10:00',
        activo: true,
      };
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue(schedule),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[Horario, horarioRepository]]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizar(
          SCHEDULE_ID,
          { startTime: '11:00' },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          'La hora final debe ser posterior a la hora inicial.',
        ),
      );
      expect(horarioRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('listarMicrorutaHorarios', () => {
    it('loads relations and applies active and day filters in order', async () => {
      const links = [{ id: LINK_ID, diaSemana: 7, activo: false }];
      const query = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(links),
      };
      const linkRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(query),
      };
      const service = createService({}, linkRepository);

      await expect(
        service.listarMicrorutaHorarios({
          isActive: false,
          dayOfWeek: 7,
        }),
      ).resolves.toEqual(links);

      expect(linkRepository.createQueryBuilder).toHaveBeenCalledWith('link');
      expect(query.leftJoinAndSelect).toHaveBeenNthCalledWith(
        1,
        'link.microruta',
        'microruta',
      );
      expect(query.leftJoinAndSelect).toHaveBeenNthCalledWith(
        2,
        'link.horario',
        'horario',
      );
      expect(query.andWhere).toHaveBeenNthCalledWith(
        1,
        'link.activo = :active',
        { active: false },
      );
      expect(query.andWhere).toHaveBeenNthCalledWith(
        2,
        'link.diaSemana = :day',
        { day: 7 },
      );
      expect(query.orderBy).toHaveBeenCalledWith('link.diaSemana', 'ASC');
    });
  });

  describe('crearMicrorutaHorario', () => {
    const dto: CrearMicrorutaHorarioDto = {
      microrouteId: ROUTE_ID,
      scheduleId: SCHEDULE_ID,
      dayOfWeek: 3,
    };

    it('creates a link after resolving the route and an active schedule', async () => {
      const microroute = { id: ROUTE_ID };
      const schedule = { id: SCHEDULE_ID, activo: true };
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue(microroute),
      };
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue(schedule),
      };
      const linkRepository = {
        create: jest.fn((value) => value),
        save: jest.fn(async (value) => ({ id: LINK_ID, ...value })),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Horario, horarioRepository],
          [MicrorutaHorario, linkRepository],
        ]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);

      await expect(
        service.crearMicrorutaHorario(dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: LINK_ID,
        microruta: microroute,
        horario: schedule,
        diaSemana: 3,
        activo: true,
      });

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: ROUTE_ID },
      });
      expect(horarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: SCHEDULE_ID, activo: true },
      });
      expect(linkRepository.create).toHaveBeenCalledWith({
        microruta: microroute,
        horario: schedule,
        diaSemana: 3,
        activo: true,
      });
      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
    });

    it('rejects a missing route before looking up the schedule', async () => {
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const horarioRepository = { findOne: jest.fn() };
      const linkRepository = { create: jest.fn(), save: jest.fn() };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Horario, horarioRepository],
          [MicrorutaHorario, linkRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.crearMicrorutaHorario(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(new NotFoundException('La microruta no existe.'));
      expect(horarioRepository.findOne).not.toHaveBeenCalled();
      expect(linkRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a missing or inactive schedule', async () => {
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue({ id: ROUTE_ID }),
      };
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      const linkRepository = { create: jest.fn(), save: jest.fn() };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Horario, horarioRepository],
          [MicrorutaHorario, linkRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.crearMicrorutaHorario(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(
        new NotFoundException('El horario no existe o está inactivo.'),
      );
      expect(horarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: SCHEDULE_ID, activo: true },
      });
      expect(linkRepository.save).not.toHaveBeenCalled();
    });

    it('translates a PostgreSQL unique violation to ConflictException', async () => {
      const routeRepository = {
        findOne: jest.fn().mockResolvedValue({ id: ROUTE_ID }),
      };
      const horarioRepository = {
        findOne: jest.fn().mockResolvedValue({ id: SCHEDULE_ID, activo: true }),
      };
      const linkRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([
          [Microruta, routeRepository],
          [Horario, horarioRepository],
          [MicrorutaHorario, linkRepository],
        ]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.crearMicrorutaHorario(dto, ACTOR_ID, REQUEST_IP),
      ).rejects.toThrow(
        new ConflictException(
          'La microruta ya tiene ese horario asociado para ese día.',
        ),
      );
    });
  });

  describe('actualizarMicrorutaHorario', () => {
    it('partially updates the day and active state while preserving relations', async () => {
      const link = {
        id: LINK_ID,
        microruta: { id: ROUTE_ID },
        horario: { id: SCHEDULE_ID },
        diaSemana: 3,
        activo: true,
      };
      const linkRepository = {
        findOne: jest.fn().mockResolvedValue(link),
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([[MicrorutaHorario, linkRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);
      const dto: ActualizarMicrorutaHorarioDto = {
        dayOfWeek: 5,
        isActive: false,
      };

      await expect(
        service.actualizarMicrorutaHorario(LINK_ID, dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        ...link,
        diaSemana: 5,
        activo: false,
      });
      expect(linkRepository.findOne).toHaveBeenCalledWith({
        where: { id: LINK_ID },
      });
      expect(linkRepository.save).toHaveBeenCalledWith(link);
      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
    });

    it('throws NotFoundException when the link does not exist', async () => {
      const linkRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[MicrorutaHorario, linkRepository]]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizarMicrorutaHorario(
          LINK_ID,
          { isActive: false },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new NotFoundException('La asociación microruta-horario no existe.'),
      );
      expect(linkRepository.save).not.toHaveBeenCalled();
    });

    it('translates a PostgreSQL unique violation to ConflictException', async () => {
      const linkRepository = {
        findOne: jest.fn().mockResolvedValue({
          id: LINK_ID,
          microruta: { id: ROUTE_ID },
          horario: { id: SCHEDULE_ID },
          diaSemana: 3,
          activo: true,
        }),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([[MicrorutaHorario, linkRepository]]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizarMicrorutaHorario(
          LINK_ID,
          { dayOfWeek: 4 },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(
        new ConflictException(
          'La microruta ya tiene ese horario asociado para ese día.',
        ),
      );
    });
  });
});
