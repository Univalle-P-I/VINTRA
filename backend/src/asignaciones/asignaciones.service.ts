import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Conductor } from '../personal/entidades/conductor.entity';
import { MicrorutaHorario } from '../turnos/entidades/microruta-horario.entity';
import { Vehiculo } from '../vehiculos/entidades/vehiculo.entity';
import { ActualizarAsignacionDto } from './dto/actualizar-asignacion.dto';
import { ConsultarAsignacionesDto } from './dto/consultar-asignaciones.dto';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { Asignacion } from './entidades/asignacion.entity';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async listar(dto: ConsultarAsignacionesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const query = this.queryWithRelations()
      .orderBy('assignment.inicioProgramado', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    this.applyFilters(query, dto);
    const [items, total] = await query.getManyAndCount();
    return { items, total, page, limit };
  }

  async listarPropias(userDataId: string, dto: ConsultarAsignacionesDto) {
    const driver = await this.conductorRepository.findOne({
      where: { datosUsuario: { id: userDataId } },
      select: { id: true, activo: true },
    });
    if (!driver) throw new NotFoundException('El conductor no existe.');
    if (!driver.activo) {
      throw new ForbiddenException('El conductor está inactivo.');
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const query = this.queryWithRelations()
      .andWhere('driver.id = :driverId', { driverId: driver.id })
      .orderBy('assignment.inicioProgramado', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    this.applyFilters(query, dto);
    const [items, total] = await query.getManyAndCount();
    return { items, total, page, limit };
  }

  async obtener(id: string): Promise<Asignacion> {
    const item = await this.asignacionRepository.findOne({
      where: { id },
      relations: {
        conductor: { datosUsuario: true },
        microrutaHorario: { microruta: true, horario: true },
        vehiculo: { tipoVehiculo: true },
      },
    });
    if (!item) throw new NotFoundException('La asignación no existe.');
    return item;
  }

  async crear(dto: CrearAsignacionDto, actorId: string, ip: string) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const driver = await manager.getRepository(Conductor).findOne({
        where: { id: dto.driverId, activo: true },
      });
      if (!driver) {
        throw new NotFoundException('El conductor no existe o está inactivo.');
      }
      const scheduleLink = await manager
        .getRepository(MicrorutaHorario)
        .findOne({
          where: { id: dto.microrouteScheduleId, activo: true },
          relations: { horario: true },
        });
      if (!scheduleLink?.horario.activo) {
        throw new NotFoundException(
          'El horario de microruta no existe o está inactivo.',
        );
      }
      const vehicle = await manager.getRepository(Vehiculo).findOne({
        where: { id: dto.vehicleId, activo: true },
      });
      if (!vehicle) {
        throw new NotFoundException('El vehículo no existe o está inactivo.');
      }

      const repository = manager.getRepository(Asignacion);
      try {
        return await repository.save(
          repository.create({
            conductor: driver,
            microrutaHorario: scheduleLink,
            vehiculo: vehicle,
            estado: dto.assignmentStatus,
            inicioProgramado: dto.scheduledStartAt,
            finProgramado: dto.scheduledEndAt,
            iniciadoEn: null,
            finalizadoEn: null,
            activo: true,
          }),
        );
      } catch (error) {
        this.throwIfUniqueViolation(error);
        throw error;
      }
    });
  }

  async actualizar(
    id: string,
    dto: ActualizarAsignacionDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Asignacion);
      const item = await repository.findOne({ where: { id } });
      if (!item) throw new NotFoundException('La asignación no existe.');

      if (dto.driverId !== undefined) {
        const driver = await manager.getRepository(Conductor).findOne({
          where: { id: dto.driverId, activo: true },
        });
        if (!driver) {
          throw new NotFoundException('El conductor no existe o está inactivo.');
        }
        item.conductor = driver;
      }
      if (dto.microrouteScheduleId !== undefined) {
        const scheduleLink = await manager
          .getRepository(MicrorutaHorario)
          .findOne({
            where: { id: dto.microrouteScheduleId, activo: true },
            relations: { horario: true },
          });
        if (!scheduleLink?.horario.activo) {
          throw new NotFoundException(
            'El horario de microruta no existe o está inactivo.',
          );
        }
        item.microrutaHorario = scheduleLink;
      }
      if (dto.vehicleId !== undefined) {
        const vehicle = await manager.getRepository(Vehiculo).findOne({
          where: { id: dto.vehicleId, activo: true },
        });
        if (!vehicle) {
          throw new NotFoundException('El vehículo no existe o está inactivo.');
        }
        item.vehiculo = vehicle;
      }
      if (dto.assignmentStatus !== undefined) {
        item.estado = dto.assignmentStatus;
      }
      if (dto.scheduledStartAt !== undefined) {
        item.inicioProgramado = dto.scheduledStartAt;
      }
      if (dto.scheduledEndAt !== undefined) {
        item.finProgramado = dto.scheduledEndAt;
      }
      if (dto.startedAt !== undefined) item.iniciadoEn = dto.startedAt;
      if (dto.endedAt !== undefined) item.finalizadoEn = dto.endedAt;
      if (item.finProgramado < item.inicioProgramado) {
        throw new BadRequestException(
          'La fecha final programada debe ser igual o posterior a la inicial.',
        );
      }
      if (
        item.finalizadoEn !== null &&
        (item.iniciadoEn === null || item.finalizadoEn < item.iniciadoEn)
      ) {
        throw new BadRequestException(
          'La fecha final real requiere una fecha de inicio real igual o anterior.',
        );
      }
      try {
        return await repository.save(item);
      } catch (error) {
        this.throwIfUniqueViolation(error);
        throw error;
      }
    });
  }

  private queryWithRelations() {
    return this.asignacionRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.conductor', 'driver')
      .leftJoinAndSelect('driver.datosUsuario', 'userData')
      .leftJoinAndSelect('driver.cuadrilla', 'crew')
      .leftJoinAndSelect('assignment.microrutaHorario', 'routeSchedule')
      .leftJoinAndSelect('routeSchedule.microruta', 'microRoute')
      .leftJoinAndSelect('routeSchedule.horario', 'schedule')
      .leftJoinAndSelect('assignment.vehiculo', 'vehicle')
      .leftJoinAndSelect('vehicle.tipoVehiculo', 'vehicleType');
  }

  private applyFilters(
    query: ReturnType<AsignacionesService['queryWithRelations']>,
    dto: ConsultarAsignacionesDto,
  ): void {
    if (dto.driverId) query.andWhere('driver.id = :driverId', { driverId: dto.driverId });
    if (dto.crewId) query.andWhere('crew.id = :crewId', { crewId: dto.crewId });
    if (dto.microrouteScheduleId) {
      query.andWhere('routeSchedule.id = :scheduleId', {
        scheduleId: dto.microrouteScheduleId,
      });
    }
    if (dto.microrouteId) {
      query.andWhere('microRoute.id = :microRouteId', {
        microRouteId: dto.microrouteId,
      });
    }
    if (dto.vehicleId) {
      query.andWhere('vehicle.id = :vehicleId', { vehicleId: dto.vehicleId });
    }
    if (dto.assignmentStatus) {
      query.andWhere('assignment.estado = :status', {
        status: dto.assignmentStatus.toUpperCase(),
      });
    }
    if (dto.scheduledStartAt) {
      query.andWhere('assignment.inicioProgramado >= :start', {
        start: dto.scheduledStartAt,
      });
    }
    if (dto.scheduledEndAt) {
      query.andWhere('assignment.finProgramado <= :end', {
        end: dto.scheduledEndAt,
      });
    }
  }

  private throwIfUniqueViolation(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException(
        'Ya existe una asignación para ese horario y fecha de inicio.',
      );
    }
  }
}
