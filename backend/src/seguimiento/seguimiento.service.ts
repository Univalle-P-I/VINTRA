import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { isGeoJsonGeometry } from '../comun/geojson.validator';
import {
  Asignacion,
  EstadoAsignacion,
} from '../asignaciones/entidades/asignacion.entity';
import { CrearPosicionVehiculoDto } from './dto/crear-posicion-vehiculo.dto';
import { ConsultarPosicionesDto } from './dto/consultar-posiciones.dto';
import { PosicionVehiculo } from './entidades/posicion-vehiculo.entity';

@Injectable()
export class SeguimientoService {
  constructor(
    @InjectRepository(PosicionVehiculo)
    private readonly posicionRepository: Repository<PosicionVehiculo>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async listar(
    assignmentId: string,
    dto: ConsultarPosicionesDto,
    userDataId?: string,
  ) {
    await this.findAssignment(assignmentId, userDataId);
    const [items, total] = await this.posicionRepository.findAndCount({
      where: { asignacion: { id: assignmentId } },
      order: { registradoEn: 'DESC' },
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
    });
    return { items, total, page: dto.page, limit: dto.limit };
  }

  async crear(
    dto: CrearPosicionVehiculoDto,
    actorId: string,
    ip: string,
    userDataId?: string,
  ) {
    if (!isGeoJsonGeometry(dto.geometry, 'Point')) {
      throw new BadRequestException(
        'geometry debe ser un GeoJSON Point con posiciones 2D.',
      );
    }

    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const assignment = await manager.getRepository(Asignacion).findOne({
        where: { id: dto.assignmentId },
        relations: { conductor: { datosUsuario: true } },
      });
      if (!assignment) {
        throw new NotFoundException('La asignación no existe.');
      }
      if (assignment.estado !== EstadoAsignacion.EN_PROGRESO) {
        throw new BadRequestException(
          'Solo se pueden registrar posiciones de asignaciones en curso.',
        );
      }
      if (
        userDataId !== undefined &&
        assignment.conductor.datosUsuario.id !== userDataId
      ) {
        throw new ForbiddenException(
          'Solo puede registrar posiciones de sus propias asignaciones.',
        );
      }
      if (userDataId !== undefined && !assignment.conductor.activo) {
        throw new ForbiddenException('El conductor está inactivo.');
      }

      const repository = manager.getRepository(PosicionVehiculo);
      return repository.save(
        repository.create({
          asignacion: assignment,
          geometria: dto.geometry,
          registradoEn: dto.recordedAt,
        }),
      );
    });
  }

  private async findAssignment(assignmentId: string, userDataId?: string) {
    const assignment = await this.asignacionRepository.findOne({
      where: { id: assignmentId },
      relations: { conductor: { datosUsuario: true } },
    });
    if (!assignment) throw new NotFoundException('La asignación no existe.');
    if (
      userDataId !== undefined &&
      assignment.conductor.datosUsuario.id !== userDataId
    ) {
      throw new ForbiddenException(
        'Solo puede consultar posiciones de sus propias asignaciones.',
      );
    }
    if (userDataId !== undefined && !assignment.conductor.activo) {
      throw new ForbiddenException('El conductor está inactivo.');
    }
    return assignment;
  }
}
