import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { Crew } from '../cuadrillas/entities/crew.entity';
import { Driver } from '../personal/entities/driver.entity';
import { Microruta } from '../rutas/microrutas/entities/microruta.entity';
import {
  ESTADO_ASIGNACION_INICIAL,
  ESTADOS_ASIGNACION_VIGENTES,
  ESTADOS_VEHICULO_NO_ASIGNABLES,
  PG_VIOLACION_UNICA,
} from './asignaciones.constants';
import { construirVentana, diaIso } from './asignaciones.utils';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { Asignacion } from './entities/asignacion.entity';
import { Horario } from './entities/horario.entity';
import { ProgramacionMicroruta } from './entities/programacion-microruta.entity';
import { Vehiculo } from './entities/vehiculo.entity';

interface Motivo {
  field: string;
  reason: string;
}

/** 409 de negocio: `message` resume y `details` explica el motivo por campo. */
function conflicto(message: string, details: Motivo[]): ConflictException {
  return new ConflictException({
    statusCode: 409,
    error: 'Conflict',
    message,
    details,
  });
}

function esViolacionUnica(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const directo = (error as { code?: unknown }).code;
  const driver = (error as { driverError?: { code?: unknown } }).driverError
    ?.code;
  return directo === PG_VIOLACION_UNICA || driver === PG_VIOLACION_UNICA;
}

@Injectable()
export class AsignacionesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Asignacion)
    private readonly asignacionesRepository: Repository<Asignacion>,
  ) {}

  /**
   * Crea una asignación en una única transacción.
   *
   * Para que dos solicitudes simultáneas no creen una doble asignación, la
   * transacción bloquea (FOR UPDATE) programación, microruta, conductor,
   * cuadrilla y vehículo siempre en ese orden (evita interbloqueos): la segunda
   * solicitud espera, ve la asignación de la primera y responde 409. Si la BD
   * rechaza igualmente por restricción única (23505), también se responde 409.
   */
  async crear(dto: CrearAsignacionDto): Promise<Asignacion> {
    try {
      return await this.dataSource.transaction((manager) =>
        this.crearEnTransaccion(manager, dto),
      );
    } catch (error) {
      if (esViolacionUnica(error)) {
        throw conflicto(
          'Ya existe una asignación para esa programación y hora.',
          [
            {
              field: 'programacionId',
              reason:
                'Ya hay una asignación con esa programación y hora de inicio.',
            },
          ],
        );
      }
      throw error;
    }
  }

  listar(): Promise<Asignacion[]> {
    return this.asignacionesRepository.find({
      order: { inicioProgramado: 'DESC' },
    });
  }

  async obtener(id: string): Promise<Asignacion> {
    const asignacion = await this.asignacionesRepository.findOne({
      where: { id },
      relations: { conductor: true, programacion: true, vehiculo: true },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada.');
    }

    return asignacion;
  }

  private async crearEnTransaccion(
    manager: EntityManager,
    dto: CrearAsignacionDto,
  ): Promise<Asignacion> {
    const lock = { mode: 'pessimistic_write' } as const;

    // 1. Existencia (orden fijo de bloqueo).
    const programacion = await manager.findOne(ProgramacionMicroruta, {
      where: { id: dto.programacionId },
      lock,
    });
    if (!programacion) {
      throw new NotFoundException('Programación de microruta no encontrada.');
    }

    const microruta = await manager.findOne(Microruta, {
      where: { id: programacion.microrutaId },
      lock,
    });
    const horario = await manager.findOne(Horario, {
      where: { id: programacion.horarioId },
    });
    if (!microruta || !horario) {
      throw new NotFoundException(
        'La programación no tiene microruta u horario válidos.',
      );
    }

    const conductor = await manager.findOne(Driver, {
      where: { id: dto.conductorId },
      lock,
    });
    if (!conductor) {
      throw new NotFoundException('Conductor no encontrado.');
    }

    const cuadrilla = conductor.crewId
      ? await manager.findOne(Crew, { where: { id: conductor.crewId }, lock })
      : null;

    const vehiculo = await manager.findOne(Vehiculo, {
      where: { id: dto.vehiculoId },
      lock,
    });
    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado.');
    }

    // 2. La fecha debe caer en el día de la programación.
    if (diaIso(dto.fecha) !== programacion.diaSemana) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'La fecha no corresponde al día de la programación.',
        details: [
          {
            field: 'fecha',
            reason: `La programación es del día ${programacion.diaSemana} (1=lunes … 7=domingo).`,
          },
        ],
      });
    }

    // 3. Habilitación y disponibilidad.
    const noDisponibles = this.motivosNoDisponible(
      programacion,
      microruta,
      horario,
      conductor,
      cuadrilla,
      vehiculo,
    );
    if (noDisponibles.length > 0) {
      throw conflicto(
        'Recursos no disponibles para la asignación.',
        noDisponibles,
      );
    }

    // 4. Conflicto temporal con asignaciones vigentes.
    const { inicio, fin } = construirVentana(
      dto.fecha,
      horario.horaInicio,
      horario.horaFin,
    );
    const ocupados = await this.motivosOcupado(manager, {
      conductor,
      vehiculo,
      microrutaId: microruta.id,
      inicio,
      fin,
    });
    if (ocupados.length > 0) {
      throw conflicto('Recursos ya asignados en ese horario.', ocupados);
    }

    // 5. Persistencia.
    const asignacion = manager.create(Asignacion, {
      conductorId: conductor.id,
      programacionId: programacion.id,
      vehiculoId: vehiculo.id,
      estado: ESTADO_ASIGNACION_INICIAL,
      inicioProgramado: inicio,
      finProgramado: fin,
      inicioReal: null,
      finReal: null,
      activo: true,
    });

    return manager.save(asignacion);
  }

  private motivosNoDisponible(
    programacion: ProgramacionMicroruta,
    microruta: Microruta,
    horario: Horario,
    conductor: Driver,
    cuadrilla: Crew | null,
    vehiculo: Vehiculo,
  ): Motivo[] {
    const motivos: Motivo[] = [];

    if (!programacion.activo || !horario.activo) {
      motivos.push({
        field: 'programacionId',
        reason: 'La programación o su horario están inactivos.',
      });
    }
    if (!microruta.activo) {
      motivos.push({
        field: 'programacionId',
        reason: 'La microruta está inactiva.',
      });
    }
    if (!conductor.isActive || conductor.endedAt) {
      motivos.push({
        field: 'conductorId',
        reason: 'El conductor está inhabilitado o ya no está vinculado.',
      });
    }
    if (conductor.crewId && (!cuadrilla || !cuadrilla.isActive)) {
      motivos.push({
        field: 'conductorId',
        reason: 'La cuadrilla del conductor está inactiva.',
      });
    }
    if (!vehiculo.activo) {
      motivos.push({
        field: 'vehiculoId',
        reason: 'El vehículo está inhabilitado.',
      });
    } else if (ESTADOS_VEHICULO_NO_ASIGNABLES.includes(vehiculo.estado)) {
      motivos.push({
        field: 'vehiculoId',
        reason: `El vehículo no está disponible (estado ${vehiculo.estado}).`,
      });
    }

    return motivos;
  }

  /**
   * Busca asignaciones vigentes que se solapan en el tiempo y comparten
   * conductor, vehículo, cuadrilla o microruta con la solicitada.
   */
  private async motivosOcupado(
    manager: EntityManager,
    datos: {
      conductor: Driver;
      vehiculo: Vehiculo;
      microrutaId: string;
      inicio: Date;
      fin: Date;
    },
  ): Promise<Motivo[]> {
    const { conductor, vehiculo, microrutaId, inicio, fin } = datos;
    // Intervalos [inicio, fin): se solapan si existente.inicio < fin y existente.fin > inicio.
    const solapada = {
      activo: true,
      estado: In(ESTADOS_ASIGNACION_VIGENTES),
      inicioProgramado: LessThan(fin),
      finProgramado: MoreThan(inicio),
    };

    const existentes = await manager.find(Asignacion, {
      where: [
        { ...solapada, conductorId: conductor.id },
        { ...solapada, vehiculoId: vehiculo.id },
        { ...solapada, programacion: { microrutaId } },
        ...(conductor.crewId
          ? [{ ...solapada, conductor: { crewId: conductor.crewId } }]
          : []),
      ],
      relations: { conductor: true, programacion: true },
    });

    const motivos: Motivo[] = [];
    if (existentes.some((a) => a.conductorId === conductor.id)) {
      motivos.push({
        field: 'conductorId',
        reason:
          'El conductor ya tiene una asignación que se cruza en ese horario.',
      });
    }
    if (existentes.some((a) => a.vehiculoId === vehiculo.id)) {
      motivos.push({
        field: 'vehiculoId',
        reason: 'El vehículo ya está ocupado en ese horario.',
      });
    }
    if (existentes.some((a) => a.programacion?.microrutaId === microrutaId)) {
      motivos.push({
        field: 'programacionId',
        reason: 'La microruta ya está asignada en ese horario.',
      });
    }
    if (
      conductor.crewId &&
      existentes.some((a) => a.conductor?.crewId === conductor.crewId)
    ) {
      motivos.push({
        field: 'conductorId',
        reason: 'La cuadrilla del conductor ya está ocupada en ese horario.',
      });
    }

    return motivos;
  }
}
