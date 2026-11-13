import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Repository } from 'typeorm';

import {
  createAuditContext,
  createManager,
} from '../../test/helpers/audit-mocks';
import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Conductor } from '../personal/entidades/conductor.entity';
import { MicrorutaHorario } from '../turnos/entidades/microruta-horario.entity';
import { Vehiculo } from '../vehiculos/entidades/vehiculo.entity';
import { Asignacion } from './entidades/asignacion.entity';
import { EstadoAsignacion } from './entidades/asignacion.entity';
import { AsignacionesService } from './asignaciones.service';

describe('AsignacionesService', () => {
  describe('listarPropias', () => {
    it('loads the conductor active flag before allowing own assignments', async () => {
      const userDataId = 'c0a80101-0000-4000-8000-000000000001';
      const driverId = 'c0a80101-0000-4000-8000-000000000002';
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      const asignacionRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      };
      const conductorRepository = {
        findOne: jest.fn().mockResolvedValue({ id: driverId, activo: true }),
      };
      const contextoAuditoria = { ejecutar: jest.fn() };
      const service = new AsignacionesService(
        asignacionRepository as unknown as Repository<Asignacion>,
        conductorRepository as unknown as Repository<Conductor>,
        contextoAuditoria as unknown as ContextoAuditoriaService,
      );

      await expect(service.listarPropias(userDataId, {})).resolves.toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      expect(conductorRepository.findOne).toHaveBeenCalledWith({
        where: { datosUsuario: { id: userDataId } },
        select: { id: true, activo: true },
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'driver.id = :driverId',
        { driverId },
      );
    });

    it('rejects inactive drivers', async () => {
      const service = new AsignacionesService(
        {} as Repository<Asignacion>,
        {
          findOne: jest.fn().mockResolvedValue({
            id: 'c0a80101-0000-4000-8000-000000000002',
            activo: false,
          }),
        } as unknown as Repository<Conductor>,
        {} as ContextoAuditoriaService,
      );

      await expect(
        service.listarPropias('c0a80101-0000-4000-8000-000000000001', {}),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
  const REQUEST_IP = '192.0.2.10';
  const DRIVER_ID = 'c0a80101-0000-4000-8000-000000000001';
  const SCHEDULE_ID = 'c0a80101-0000-4000-8000-000000000002';
  const VEHICLE_ID = 'c0a80101-0000-4000-8000-000000000003';
  const ASSIGNMENT_ID = 'c0a80101-0000-4000-8000-000000000004';

  function createAssignment() {
    return {
      id: ASSIGNMENT_ID,
      conductor: { id: DRIVER_ID, activo: true },
      microrutaHorario: {
        id: SCHEDULE_ID,
        horario: { activo: true },
      },
      vehiculo: { id: VEHICLE_ID, activo: true },
      estado: EstadoAsignacion.PROGRAMADA,
      inicioProgramado: new Date('2026-11-12T10:00:00.000Z'),
      finProgramado: new Date('2026-11-12T12:00:00.000Z'),
      iniciadoEn: null,
      finalizadoEn: null,
      activo: true,
    };
  }

  describe('AsignacionesService additional coverage', () => {
    describe('listar', () => {
      it('applies filters, relation joins, ordering, and requested pagination', async () => {
        const items = [createAssignment()];
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([items, 7]),
        };
        const asignacionRepository = {
          createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        };
        const service = new AsignacionesService(
          asignacionRepository as unknown as Repository<Asignacion>,
          {} as Repository<Conductor>,
          {} as ContextoAuditoriaService,
        );
        const start = new Date('2026-11-12T08:00:00.000Z');
        const end = new Date('2026-11-12T18:00:00.000Z');

        await expect(
          service.listar({
            driverId: DRIVER_ID,
            crewId: 'c0a80101-0000-4000-8000-000000000005',
            microrouteScheduleId: SCHEDULE_ID,
            microrouteId: 'c0a80101-0000-4000-8000-000000000006',
            vehicleId: VEHICLE_ID,
            assignmentStatus: EstadoAsignacion.EN_PROGRESO,
            scheduledStartAt: start,
            scheduledEndAt: end,
            page: 2,
            limit: 5,
          }),
        ).resolves.toEqual({ items, total: 7, page: 2, limit: 5 });

        expect(asignacionRepository.createQueryBuilder).toHaveBeenCalledWith(
          'assignment',
        );
        expect(queryBuilder.leftJoinAndSelect.mock.calls).toEqual([
          ['assignment.conductor', 'driver'],
          ['driver.datosUsuario', 'userData'],
          ['driver.cuadrilla', 'crew'],
          ['assignment.microrutaHorario', 'routeSchedule'],
          ['routeSchedule.microruta', 'microRoute'],
          ['routeSchedule.horario', 'schedule'],
          ['assignment.vehiculo', 'vehicle'],
          ['vehicle.tipoVehiculo', 'vehicleType'],
        ]);
        expect(queryBuilder.andWhere.mock.calls).toEqual([
          ['driver.id = :driverId', { driverId: DRIVER_ID }],
          [
            'crew.id = :crewId',
            { crewId: 'c0a80101-0000-4000-8000-000000000005' },
          ],
          ['routeSchedule.id = :scheduleId', { scheduleId: SCHEDULE_ID }],
          [
            'microRoute.id = :microRouteId',
            { microRouteId: 'c0a80101-0000-4000-8000-000000000006' },
          ],
          ['vehicle.id = :vehicleId', { vehicleId: VEHICLE_ID }],
          ['assignment.estado = :status', { status: 'IN_PROGRESS' }],
          ['assignment.inicioProgramado >= :start', { start }],
          ['assignment.finProgramado <= :end', { end }],
        ]);
        expect(queryBuilder.orderBy).toHaveBeenCalledWith(
          'assignment.inicioProgramado',
          'DESC',
        );
        expect(queryBuilder.skip).toHaveBeenCalledWith(5);
        expect(queryBuilder.take).toHaveBeenCalledWith(5);
      });
    });

    describe('listarPropias', () => {
      it('throws NotFoundException when the authenticated user has no driver record', async () => {
        const conductorRepository = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          conductorRepository as unknown as Repository<Conductor>,
          {} as ContextoAuditoriaService,
        );

        await expect(
          service.listarPropias('missing-user-data-id', {}),
        ).rejects.toThrow(new NotFoundException('El conductor no existe.'));
        expect(conductorRepository.findOne).toHaveBeenCalledWith({
          where: { datosUsuario: { id: 'missing-user-data-id' } },
          select: { id: true, activo: true },
        });
      });
    });

    describe('obtener', () => {
      it('returns an assignment with all required relations', async () => {
        const assignment = createAssignment();
        const asignacionRepository = {
          findOne: jest.fn().mockResolvedValue(assignment),
        };
        const service = new AsignacionesService(
          asignacionRepository as unknown as Repository<Asignacion>,
          {} as Repository<Conductor>,
          {} as ContextoAuditoriaService,
        );

        await expect(service.obtener(ASSIGNMENT_ID)).resolves.toBe(assignment);
        expect(asignacionRepository.findOne).toHaveBeenCalledWith({
          where: { id: ASSIGNMENT_ID },
          relations: {
            conductor: { datosUsuario: true },
            microrutaHorario: { microruta: true, horario: true },
            vehiculo: { tipoVehiculo: true },
          },
        });
      });

      it('throws NotFoundException when the assignment does not exist', async () => {
        const asignacionRepository = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        const service = new AsignacionesService(
          asignacionRepository as unknown as Repository<Asignacion>,
          {} as Repository<Conductor>,
          {} as ContextoAuditoriaService,
        );

        await expect(service.obtener(ASSIGNMENT_ID)).rejects.toThrow(
          new NotFoundException('La asignación no existe.'),
        );
      });
    });

    describe('crear', () => {
      const dto = {
        driverId: DRIVER_ID,
        microrouteScheduleId: SCHEDULE_ID,
        vehicleId: VEHICLE_ID,
        assignmentStatus: EstadoAsignacion.PROGRAMADA,
        scheduledStartAt: new Date('2026-11-12T10:00:00.000Z'),
        scheduledEndAt: new Date('2026-11-12T12:00:00.000Z'),
      };

      it('creates an assignment after finding active related records', async () => {
        const driver = { id: DRIVER_ID, activo: true };
        const scheduleLink = {
          id: SCHEDULE_ID,
          activo: true,
          horario: { activo: true },
        };
        const vehicle = { id: VEHICLE_ID, activo: true };
        const assignment = {
          ...createAssignment(),
          conductor: driver,
          microrutaHorario: scheduleLink,
          vehiculo: vehicle,
        };
        const conductorRepository = {
          findOne: jest.fn().mockResolvedValue(driver),
        };
        const scheduleRepository = {
          findOne: jest.fn().mockResolvedValue(scheduleLink),
        };
        const vehicleRepository = {
          findOne: jest.fn().mockResolvedValue(vehicle),
        };
        const assignmentRepository = {
          create: jest.fn((value) => value),
          save: jest.fn().mockResolvedValue(assignment),
        };
        const manager = createManager(
          new Map<Function, object>([
            [Conductor, conductorRepository],
            [MicrorutaHorario, scheduleRepository],
            [Vehiculo, vehicleRepository],
            [Asignacion, assignmentRepository],
          ]),
        );
        const contextoAuditoria = createAuditContext(manager);
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          contextoAuditoria as unknown as ContextoAuditoriaService,
        );

        await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).resolves.toBe(
          assignment,
        );

        expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
          ACTOR_ID,
          REQUEST_IP,
          expect.any(Function),
        );
        expect(conductorRepository.findOne).toHaveBeenCalledWith({
          where: { id: DRIVER_ID, activo: true },
        });
        expect(scheduleRepository.findOne).toHaveBeenCalledWith({
          where: { id: SCHEDULE_ID, activo: true },
          relations: { horario: true },
        });
        expect(vehicleRepository.findOne).toHaveBeenCalledWith({
          where: { id: VEHICLE_ID, activo: true },
        });
        expect(assignmentRepository.create).toHaveBeenCalledWith({
          conductor: driver,
          microrutaHorario: scheduleLink,
          vehiculo: vehicle,
          estado: dto.assignmentStatus,
          inicioProgramado: dto.scheduledStartAt,
          finProgramado: dto.scheduledEndAt,
          iniciadoEn: null,
          finalizadoEn: null,
          activo: true,
        });
        expect(assignmentRepository.save).toHaveBeenCalled();
      });

      it('rejects an inactive or missing driver before looking up other relations', async () => {
        const conductorRepository = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        const scheduleRepository = { findOne: jest.fn() };
        const vehicleRepository = { findOne: jest.fn() };
        const assignmentRepository = { create: jest.fn(), save: jest.fn() };
        const manager = createManager(
          new Map<Function, object>([
            [Conductor, conductorRepository],
            [MicrorutaHorario, scheduleRepository],
            [Vehiculo, vehicleRepository],
            [Asignacion, assignmentRepository],
          ]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
          new NotFoundException('El conductor no existe o está inactivo.'),
        );
        expect(scheduleRepository.findOne).not.toHaveBeenCalled();
        expect(vehicleRepository.findOne).not.toHaveBeenCalled();
      });

      it('rejects a missing or inactive microroute schedule', async () => {
        const conductorRepository = {
          findOne: jest.fn().mockResolvedValue({ id: DRIVER_ID, activo: true }),
        };
        const scheduleRepository = {
          findOne: jest.fn().mockResolvedValue({
            id: SCHEDULE_ID,
            horario: { activo: false },
          }),
        };
        const vehicleRepository = { findOne: jest.fn() };
        const assignmentRepository = { create: jest.fn(), save: jest.fn() };
        const manager = createManager(
          new Map<Function, object>([
            [Conductor, conductorRepository],
            [MicrorutaHorario, scheduleRepository],
            [Vehiculo, vehicleRepository],
            [Asignacion, assignmentRepository],
          ]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
          new NotFoundException(
            'El horario de microruta no existe o está inactivo.',
          ),
        );
        expect(vehicleRepository.findOne).not.toHaveBeenCalled();
        expect(assignmentRepository.save).not.toHaveBeenCalled();
      });

      it('rejects a missing or inactive vehicle', async () => {
        const conductorRepository = {
          findOne: jest.fn().mockResolvedValue({ id: DRIVER_ID, activo: true }),
        };
        const scheduleRepository = {
          findOne: jest.fn().mockResolvedValue({
            id: SCHEDULE_ID,
            horario: { activo: true },
          }),
        };
        const vehicleRepository = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        const assignmentRepository = { create: jest.fn(), save: jest.fn() };
        const manager = createManager(
          new Map<Function, object>([
            [Conductor, conductorRepository],
            [MicrorutaHorario, scheduleRepository],
            [Vehiculo, vehicleRepository],
            [Asignacion, assignmentRepository],
          ]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
          new NotFoundException('El vehículo no existe o está inactivo.'),
        );
        expect(assignmentRepository.save).not.toHaveBeenCalled();
      });

      it('translates a PostgreSQL unique violation to ConflictException', async () => {
        const conductorRepository = {
          findOne: jest.fn().mockResolvedValue({ id: DRIVER_ID, activo: true }),
        };
        const scheduleRepository = {
          findOne: jest.fn().mockResolvedValue({
            id: SCHEDULE_ID,
            horario: { activo: true },
          }),
        };
        const vehicleRepository = {
          findOne: jest
            .fn()
            .mockResolvedValue({ id: VEHICLE_ID, activo: true }),
        };
        const assignmentRepository = {
          create: jest.fn((value) => value),
          save: jest.fn().mockRejectedValue({ code: '23505' }),
        };
        const manager = createManager(
          new Map<Function, object>([
            [Conductor, conductorRepository],
            [MicrorutaHorario, scheduleRepository],
            [Vehiculo, vehicleRepository],
            [Asignacion, assignmentRepository],
          ]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
          new ConflictException(
            'Ya existe una asignación para ese horario y fecha de inicio.',
          ),
        );
      });
    });

    describe('actualizar', () => {
      it('applies partial updates and preserves omitted assignment fields', async () => {
        const assignment = createAssignment();
        const assignmentRepository = {
          findOne: jest.fn().mockResolvedValue(assignment),
          save: jest.fn(async (value) => value),
        };
        const dataRepository = { save: jest.fn() };
        const manager = createManager(
          new Map<Function, object>([[Asignacion, assignmentRepository]]),
        );
        const contextoAuditoria = createAuditContext(manager);
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          contextoAuditoria as unknown as ContextoAuditoriaService,
        );
        const startedAt = new Date('2026-11-12T10:15:00.000Z');
        const scheduledEndAt = new Date('2026-11-12T13:00:00.000Z');

        await expect(
          service.actualizar(
            ASSIGNMENT_ID,
            { scheduledEndAt, startedAt },
            ACTOR_ID,
            REQUEST_IP,
          ),
        ).resolves.toEqual({
          ...assignment,
          finProgramado: scheduledEndAt,
          iniciadoEn: startedAt,
        });

        expect(contextoAuditoria.ejecutar).toHaveBeenCalledWith(
          ACTOR_ID,
          REQUEST_IP,
          expect.any(Function),
        );
        expect(assignmentRepository.findOne).toHaveBeenCalledWith({
          where: { id: ASSIGNMENT_ID },
        });
        expect(assignmentRepository.save).toHaveBeenCalledWith(assignment);
        expect(dataRepository.save).not.toHaveBeenCalled();
      });

      it('replaces related records only with active entities', async () => {
        const assignment = createAssignment();
        const driver = { id: 'replacement-driver-id', activo: true };
        const scheduleLink = {
          id: 'replacement-schedule-id',
          activo: true,
          horario: { activo: true },
        };
        const vehicle = { id: 'replacement-vehicle-id', activo: true };
        const assignmentRepository = {
          findOne: jest.fn().mockResolvedValue(assignment),
          save: jest.fn(async (value) => value),
        };
        const conductorRepository = {
          findOne: jest.fn().mockResolvedValue(driver),
        };
        const scheduleRepository = {
          findOne: jest.fn().mockResolvedValue(scheduleLink),
        };
        const vehicleRepository = {
          findOne: jest.fn().mockResolvedValue(vehicle),
        };
        const manager = createManager(
          new Map<Function, object>([
            [Asignacion, assignmentRepository],
            [Conductor, conductorRepository],
            [MicrorutaHorario, scheduleRepository],
            [Vehiculo, vehicleRepository],
          ]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(
          service.actualizar(
            ASSIGNMENT_ID,
            {
              driverId: driver.id,
              microrouteScheduleId: scheduleLink.id,
              vehicleId: vehicle.id,
            },
            ACTOR_ID,
            REQUEST_IP,
          ),
        ).resolves.toMatchObject({
          conductor: driver,
          microrutaHorario: scheduleLink,
          vehiculo: vehicle,
        });

        expect(conductorRepository.findOne).toHaveBeenCalledWith({
          where: { id: driver.id, activo: true },
        });
        expect(scheduleRepository.findOne).toHaveBeenCalledWith({
          where: { id: scheduleLink.id, activo: true },
          relations: { horario: true },
        });
        expect(vehicleRepository.findOne).toHaveBeenCalledWith({
          where: { id: vehicle.id, activo: true },
        });
      });

      it('throws NotFoundException when the assignment does not exist', async () => {
        const assignmentRepository = {
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn(),
        };
        const manager = createManager(
          new Map<Function, object>([[Asignacion, assignmentRepository]]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(
          service.actualizar(ASSIGNMENT_ID, {}, ACTOR_ID, REQUEST_IP),
        ).rejects.toThrow(new NotFoundException('La asignación no existe.'));
        expect(assignmentRepository.save).not.toHaveBeenCalled();
      });

      it('rejects a scheduled end before its start', async () => {
        const assignment = createAssignment();
        const assignmentRepository = {
          findOne: jest.fn().mockResolvedValue(assignment),
          save: jest.fn(),
        };
        const manager = createManager(
          new Map<Function, object>([[Asignacion, assignmentRepository]]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(
          service.actualizar(
            ASSIGNMENT_ID,
            { scheduledEndAt: new Date('2026-11-12T09:00:00.000Z') },
            ACTOR_ID,
            REQUEST_IP,
          ),
        ).rejects.toThrow(
          new BadRequestException(
            'La fecha final programada debe ser igual o posterior a la inicial.',
          ),
        );
        expect(assignmentRepository.save).not.toHaveBeenCalled();
      });

      it.each([
        ['without a real start', null, new Date('2026-11-12T11:00:00.000Z')],
        [
          'before the real start',
          new Date('2026-11-12T10:30:00.000Z'),
          new Date('2026-11-12T10:00:00.000Z'),
        ],
      ])('rejects a real end %s', async (_description, startedAt, endedAt) => {
        const assignment = {
          ...createAssignment(),
          iniciadoEn: startedAt,
        };
        const assignmentRepository = {
          findOne: jest.fn().mockResolvedValue(assignment),
          save: jest.fn(),
        };
        const manager = createManager(
          new Map<Function, object>([[Asignacion, assignmentRepository]]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(
          service.actualizar(ASSIGNMENT_ID, { endedAt }, ACTOR_ID, REQUEST_IP),
        ).rejects.toThrow(
          new BadRequestException(
            'La fecha final real requiere una fecha de inicio real igual o anterior.',
          ),
        );
        expect(assignmentRepository.save).not.toHaveBeenCalled();
      });

      it('translates a PostgreSQL unique violation to ConflictException', async () => {
        const assignment = createAssignment();
        const assignmentRepository = {
          findOne: jest.fn().mockResolvedValue(assignment),
          save: jest.fn().mockRejectedValue({ code: '23505' }),
        };
        const manager = createManager(
          new Map<Function, object>([[Asignacion, assignmentRepository]]),
        );
        const service = new AsignacionesService(
          {} as Repository<Asignacion>,
          {} as Repository<Conductor>,
          createAuditContext(manager) as unknown as ContextoAuditoriaService,
        );

        await expect(
          service.actualizar(
            ASSIGNMENT_ID,
            { assignmentStatus: EstadoAsignacion.CANCELADA },
            ACTOR_ID,
            REQUEST_IP,
          ),
        ).rejects.toThrow(
          new ConflictException(
            'Ya existe una asignación para ese horario y fecha de inicio.',
          ),
        );
      });
    });
  });
});
