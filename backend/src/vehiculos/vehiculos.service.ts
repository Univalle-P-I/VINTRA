import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  assertValidStatusTransition,
  EstadoVehiculoCatalogItem,
  isVehicleAssignable,
  VEHICLE_STATUS_CATALOG,
} from './domain/estado-vehiculo.rules';
import { ActualizarEstadoVehiculoDto } from './dto/actualizar-estado-vehiculo.dto';
import { ActualizarTipoVehiculoDto } from './dto/actualizar-tipo-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';
import { ConsultarVehiculosDto } from './dto/consultar-vehiculos.dto';
import { CrearTipoVehiculoDto } from './dto/crear-tipo-vehiculo.dto';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { TipoVehiculo } from './entidades/tipo-vehiculo.entity';
import { VehiculoAuditLog } from './entidades/vehiculo-audit-log.entity';
import { EstadoVehiculo, Vehiculo } from './entidades/vehiculo.entity';

export type VehiculoConDisponibilidad = Vehiculo & {
  esAsignable: boolean;
};

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(TipoVehiculo)
    private readonly tipoRepository: Repository<TipoVehiculo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(VehiculoAuditLog)
    private readonly auditLogRepository: Repository<VehiculoAuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  listarEstados(): readonly EstadoVehiculoCatalogItem[] {
    return VEHICLE_STATUS_CATALOG;
  }

  listarTipos(): Promise<TipoVehiculo[]> {
    return this.tipoRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async crearTipo(
    dto: CrearTipoVehiculoDto,
    actorId: string,
    requestIp: string,
  ): Promise<TipoVehiculo> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(TipoVehiculo);
        const saved = await repository.save(
          repository.create({
            codigo: dto.code,
            nombre: dto.name,
            activo: dto.isActive ?? true,
          }),
        );

        const auditRepo = manager.getRepository(VehiculoAuditLog);
        await auditRepo.save(
          auditRepo.create({
            actor: actorId,
            action: 'CREATE',
            entity: 'vehicle_type',
            entityId: saved.id,
            oldValues: null,
            newValues: {
              code: saved.codigo,
              name: saved.nombre,
              isActive: saved.activo,
            },
            requestIp: requestIp || null,
          }),
        );

        return saved;
      });
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un tipo con ese cÃ³digo.');
      throw error;
    }
  }

  async actualizarTipo(
    id: string,
    dto: ActualizarTipoVehiculoDto,
    actorId: string,
    requestIp: string,
  ): Promise<TipoVehiculo> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(TipoVehiculo);
        const type = await repository.findOneBy({ id });
        if (!type) {
          throw new NotFoundException('El tipo de vehÃ­culo no existe.');
        }

        const oldValues = {
          code: type.codigo,
          name: type.nombre,
          isActive: type.activo,
        };

        if (dto.code !== undefined) type.codigo = dto.code;
        if (dto.name !== undefined) type.nombre = dto.name;
        if (dto.isActive !== undefined) type.activo = dto.isActive;

        const saved = await repository.save(type);

        const auditRepo = manager.getRepository(VehiculoAuditLog);
        await auditRepo.save(
          auditRepo.create({
            actor: actorId,
            action: 'UPDATE',
            entity: 'vehicle_type',
            entityId: saved.id,
            oldValues,
            newValues: {
              code: saved.codigo,
              name: saved.nombre,
              isActive: saved.activo,
            },
            requestIp: requestIp || null,
          }),
        );

        return saved;
      });
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un tipo con ese cÃ³digo.');
      throw error;
    }
  }

  async listar(
    query: ConsultarVehiculosDto = {},
  ): Promise<VehiculoConDisponibilidad[]> {
    const qb = this.vehiculoRepository
      .createQueryBuilder('vehiculo')
      .leftJoinAndSelect('vehiculo.tipoVehiculo', 'tipoVehiculo')
      .orderBy('vehiculo.placa', 'ASC');

    if (query.onlyAssignable) {
      qb.andWhere('vehiculo.activo = :activo', { activo: true });
      qb.andWhere('vehiculo.estado = :estadoDisponible', {
        estadoDisponible: EstadoVehiculo.DISPONIBLE,
      });
    } else if (query.isActive !== undefined) {
      qb.andWhere('vehiculo.activo = :activo', { activo: query.isActive });
    } else {
      qb.andWhere('vehiculo.activo = :activo', { activo: true });
    }

    const effectiveStatus = query.status ?? query.vehicleStatus;
    if (effectiveStatus) {
      qb.andWhere('vehiculo.estado = :status', { status: effectiveStatus });
    }

    if (query.vehicleTypeId) {
      qb.andWhere('tipoVehiculo.id = :vehicleTypeId', {
        vehicleTypeId: query.vehicleTypeId,
      });
    }

    if (query.plate) {
      qb.andWhere('UPPER(vehiculo.placa) LIKE :plate', {
        plate: `%${query.plate}%`,
      });
    }

    if (query.page !== undefined || query.limit !== undefined) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 20;
      qb.skip((page - 1) * limit).take(limit);
    }

    const items = await qb.getMany();
    return items.map((vehicle) => this.withAvailability(vehicle));
  }

  async obtener(id: string): Promise<VehiculoConDisponibilidad> {
    const vehicle = await this.vehiculoRepository.findOne({
      where: { id },
      relations: { tipoVehiculo: true },
    });
    if (!vehicle) {
      throw new NotFoundException('El vehÃ­culo no existe.');
    }
    return this.withAvailability(vehicle);
  }
  async crear(
    dto: CrearVehiculoDto,
    actorId: string,
    requestIp: string,
  ): Promise<VehiculoConDisponibilidad> {
    if (dto.vehicleStatus === EstadoVehiculo.FUERA_DE_SERVICIO) {
      const trimmedReason = dto.reason?.trim() ?? '';
      if (trimmedReason.length < 5) {
        throw new BadRequestException({
          code: 'FAILURE_REASON_REQUIRED',
          message:
            'Para registrar un vehÃ­culo inhabilitado (out_of_service) debe indicar un motivo descriptivo (mÃ­nimo 5 caracteres).',
        });
      }
    }

    const type = await this.tipoRepository.findOne({
      where: { id: dto.vehicleTypeId, activo: true },
    });
    if (!type) {
      throw new NotFoundException(
        'El tipo de vehÃ­culo no existe o estÃ¡ inactivo.',
      );
    }

    try {
      const saved = await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(Vehiculo);
        const created = await repository.save(
          repository.create({
            tipoVehiculo: type,
            estado: dto.vehicleStatus,
            placa: dto.plate,
            capacidadKg: dto.capacityKg,
            capacidadYd3: dto.capacityYd3,
            activo: dto.isActive ?? true,
          }),
        );

        const auditRepo = manager.getRepository(VehiculoAuditLog);
        await auditRepo.save(
          auditRepo.create({
            actor: actorId,
            action: 'CREATE',
            entity: 'vehicle',
            entityId: created.id,
            oldValues: null,
            newValues: {
              plate: created.placa,
              vehicleTypeId: type.id,
              vehicleStatus: created.estado,
              capacityKg: created.capacidadKg,
              capacityYd3: created.capacidadYd3,
              isActive: created.activo,
              ...(dto.reason ? { reason: dto.reason.trim() } : {}),
            },
            requestIp: requestIp || null,
          }),
        );

        return created;
      });

      return this.withAvailability(saved);
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un vehÃ­culo con esa placa.');
      throw error;
    }
  }

  async actualizarEstado(
    id: string,
    dto: ActualizarEstadoVehiculoDto,
    actorId: string,
    requestIp: string,
  ): Promise<VehiculoConDisponibilidad> {
    const updated = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Vehiculo);
      const vehicle = await repository.findOne({
        where: { id },
        relations: { tipoVehiculo: true },
      });
      if (!vehicle) {
        throw new NotFoundException('El vehÃ­culo no existe.');
      }

      assertValidStatusTransition({
        currentStatus: vehicle.estado,
        targetStatus: dto.vehicleStatus,
        reason: dto.reason,
      });

      const previousStatus = vehicle.estado;
      const previousAssignable = isVehicleAssignable(vehicle);

      vehicle.estado = dto.vehicleStatus;
      vehicle.actualizadoEn = new Date();

      const saved = await repository.save(vehicle);
      const nextAssignable = isVehicleAssignable(saved);

      const auditRepo = manager.getRepository(VehiculoAuditLog);
      await auditRepo.save(
        auditRepo.create({
          actor: actorId,
          action: 'STATUS_CHANGE',
          entity: 'vehicle',
          entityId: saved.id,
          oldValues: {
            vehicleStatus: previousStatus,
            esAsignable: previousAssignable,
          },
          newValues: {
            vehicleStatus: saved.estado,
            esAsignable: nextAssignable,
            ...(dto.reason ? { reason: dto.reason.trim() } : {}),
          },
          requestIp: requestIp || null,
        }),
      );

      return saved;
    });

    return this.withAvailability(updated);
  }

  async actualizar(
    id: string,
    dto: ActualizarVehiculoDto,
    actorId: string,
    requestIp: string,
  ): Promise<VehiculoConDisponibilidad> {
    try {
      const updated = await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(Vehiculo);
        const vehicle = await repository.findOne({
          where: { id },
          relations: { tipoVehiculo: true },
        });
        if (!vehicle) {
          throw new NotFoundException('El vehÃ­culo no existe.');
        }

        const oldValues = {
          vehicleTypeId: vehicle.tipoVehiculo?.id ?? null,
          vehicleStatus: vehicle.estado,
          plate: vehicle.placa,
          capacityKg: vehicle.capacidadKg,
          capacityYd3: vehicle.capacidadYd3,
          isActive: vehicle.activo,
          esAsignable: isVehicleAssignable(vehicle),
        };

        if (dto.vehicleStatus !== undefined) {
          assertValidStatusTransition({
            currentStatus: vehicle.estado,
            targetStatus: dto.vehicleStatus,
            reason: dto.reason,
          });
          vehicle.estado = dto.vehicleStatus;
        }

        if (dto.vehicleTypeId !== undefined) {
          const type = await manager.getRepository(TipoVehiculo).findOne({
            where: { id: dto.vehicleTypeId, activo: true },
          });
          if (!type) {
            throw new NotFoundException(
              'El tipo de vehÃ­culo no existe o estÃ¡ inactivo.',
            );
          }
          vehicle.tipoVehiculo = type;
        }

        if (dto.plate !== undefined) vehicle.placa = dto.plate;
        if (dto.capacityKg !== undefined) vehicle.capacidadKg = dto.capacityKg;
        if (dto.capacityYd3 !== undefined) {
          vehicle.capacidadYd3 = dto.capacityYd3;
        }
        if (dto.isActive !== undefined) vehicle.activo = dto.isActive;
        vehicle.actualizadoEn = new Date();

        const saved = await repository.save(vehicle);

        const auditRepo = manager.getRepository(VehiculoAuditLog);
        await auditRepo.save(
          auditRepo.create({
            actor: actorId,
            action:
              dto.vehicleStatus !== undefined ? 'STATUS_CHANGE' : 'UPDATE',
            entity: 'vehicle',
            entityId: saved.id,
            oldValues,
            newValues: {
              vehicleTypeId: saved.tipoVehiculo?.id ?? null,
              vehicleStatus: saved.estado,
              plate: saved.placa,
              capacityKg: saved.capacidadKg,
              capacityYd3: saved.capacidadYd3,
              isActive: saved.activo,
              esAsignable: isVehicleAssignable(saved),
              ...(dto.reason ? { reason: dto.reason.trim() } : {}),
            },
            requestIp: requestIp || null,
          }),
        );

        return saved;
      });

      return this.withAvailability(updated);
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un vehÃ­culo con esa placa.');
      throw error;
    }
  }

  private withAvailability(vehicle: Vehiculo): VehiculoConDisponibilidad {
    return Object.assign(vehicle, {
      esAsignable: isVehicleAssignable({
        activo: vehicle.activo,
        estado: vehicle.estado,
      }),
    });
  }

  private throwIfUniqueViolation(error: unknown, message: string): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException(message);
    }
  }
}
