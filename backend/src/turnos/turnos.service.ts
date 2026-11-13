import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Microruta } from '../rutas/entidades/microruta.entity';
import { ActualizarHorarioDto } from './dto/actualizar-horario.dto';
import { ActualizarMicrorutaHorarioDto } from './dto/actualizar-microruta-horario.dto';
import { ConsultarMicrorutaHorariosDto } from './dto/consultar-microruta-horarios.dto';
import { ConsultarTurnosDto } from './dto/consultar-turnos.dto';
import { CrearHorarioDto } from './dto/crear-horario.dto';
import { CrearMicrorutaHorarioDto } from './dto/crear-microruta-horario.dto';
import { Horario } from './entidades/horario.entity';
import { MicrorutaHorario } from './entidades/microruta-horario.entity';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,
    @InjectRepository(MicrorutaHorario)
    private readonly microrutaHorarioRepository: Repository<MicrorutaHorario>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async listar(dto: ConsultarTurnosDto) {
    const page = dto.page ?? 0;
    const size = dto.size ?? 20;
    const [items, total] = await this.horarioRepository.findAndCount({
      where: dto.isActive === undefined ? {} : { activo: dto.isActive },
      order: { horaInicio: 'ASC' },
      skip: page * size,
      take: size,
    });
    return { items, total, page, size };
  }

  async obtener(id: string): Promise<Horario> {
    const schedule = await this.horarioRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('El horario no existe.');
    return schedule;
  }

  crear(dto: CrearHorarioDto, actorId: string, ip: string) {
    this.validarRangoHorario(dto.startTime, dto.endTime);
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Horario);
      return repository.save(
        repository.create({
          nombre: dto.name ?? null,
          horaInicio: dto.startTime,
          horaFin: dto.endTime,
          activo: true,
        }),
      );
    });
  }

  async actualizar(
    id: string,
    dto: ActualizarHorarioDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Horario);
      const schedule = await repository.findOne({ where: { id } });
      if (!schedule) throw new NotFoundException('El horario no existe.');
      this.validarRangoHorario(
        dto.startTime ?? schedule.horaInicio,
        dto.endTime ?? schedule.horaFin,
      );
      if (dto.name !== undefined) schedule.nombre = dto.name;
      if (dto.startTime !== undefined) schedule.horaInicio = dto.startTime;
      if (dto.endTime !== undefined) schedule.horaFin = dto.endTime;
      if (dto.isActive !== undefined) schedule.activo = dto.isActive;
      return repository.save(schedule);
    });
  }

  listarMicrorutaHorarios(dto: ConsultarMicrorutaHorariosDto) {
    const query = this.microrutaHorarioRepository
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.microruta', 'microruta')
      .leftJoinAndSelect('link.horario', 'horario')
      .orderBy('link.diaSemana', 'ASC');
    if (dto.isActive !== undefined) {
      query.andWhere('link.activo = :active', { active: dto.isActive });
    }
    if (dto.dayOfWeek !== undefined) {
      query.andWhere('link.diaSemana = :day', { day: dto.dayOfWeek });
    }
    return query.getMany();
  }

  async crearMicrorutaHorario(
    dto: CrearMicrorutaHorarioDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const microruta = await manager
        .getRepository(Microruta)
        .findOne({ where: { id: dto.microrouteId } });
      if (!microruta) {
        throw new NotFoundException('La microruta no existe.');
      }
      const horario = await manager.getRepository(Horario).findOne({
        where: { id: dto.scheduleId, activo: true },
      });
      if (!horario) {
        throw new NotFoundException('El horario no existe o está inactivo.');
      }
      const repository = manager.getRepository(MicrorutaHorario);
      try {
        return await repository.save(
          repository.create({
            microruta,
            horario,
            diaSemana: dto.dayOfWeek,
            activo: true,
          }),
        );
      } catch (error) {
        this.throwIfUniqueViolation(error);
        throw error;
      }
    });
  }

  async actualizarMicrorutaHorario(
    id: string,
    dto: ActualizarMicrorutaHorarioDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(MicrorutaHorario);
      const link = await repository.findOne({ where: { id } });
      if (!link) {
        throw new NotFoundException('La asociación microruta-horario no existe.');
      }
      if (dto.dayOfWeek !== undefined) link.diaSemana = dto.dayOfWeek;
      if (dto.isActive !== undefined) link.activo = dto.isActive;
      try {
        return await repository.save(link);
      } catch (error) {
        this.throwIfUniqueViolation(error);
        throw error;
      }
    });
  }

  private validarRangoHorario(startTime: string, endTime: string): void {
    const seconds = (value: string): number => {
      const [hours, minutes, seconds = '0'] = value.split(':');
      return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    };
    if (seconds(endTime) <= seconds(startTime)) {
      throw new BadRequestException(
        'La hora final debe ser posterior a la hora inicial.',
      );
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
        'La microruta ya tiene ese horario asociado para ese día.',
      );
    }
  }
}
