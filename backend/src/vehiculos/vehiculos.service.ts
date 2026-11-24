import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

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
import { EstadoVehiculo, Vehiculo } from './entidades/vehiculo.entity';

export type VehiculoConDisponibilidad = Vehiculo & {
  esAsignable: boolean;
};

function parseBooleanFilter(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
}

function parsePositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }
  return parsed;
}

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(TipoVehiculo)
    private readonly tipoRepository: Repository<TipoVehiculo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
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
        await this.setAuditContext(manager, actorId, requestIp);
        const repository = manager.getRepository(TipoVehiculo);
        return repository.save(
          repository.create({
            codigo: dto.code,
            nombre: dto.name,
            activo: dto.isActive ?? true,
          }),
        );
      });
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un tipo con ese código.');
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
        await this.setAuditContext(manager, actorId, requestIp);
        const repository = manager.getRepository(TipoVehiculo);
        const type = await repository.findOneBy({ id });
        if (!type) {
          throw new NotFoundException('El tipo de vehículo no existe.');
        }

        if (dto.code !== undefined) type.codigo = dto.code;
        if (dto.name !== undefined) type.nombre = dto.name;
        if (dto.isActive !== undefined) type.activo = dto.isActive;

        return repository.save(type);
      });
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un tipo con ese código.');
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

    const onlyAssignable = parseBooleanFilter(query.onlyAssignable);
    const isActive = parseBooleanFilter(query.isActive);

    if (onlyAssignable === true) {
      qb.andWhere('vehiculo.activo = :activo', { activo: true });
      qb.andWhere('vehiculo.estado = :estadoDisponible', {
        estadoDisponible: EstadoVehiculo.DISPONIBLE,
      });
    } else if (isActive !== undefined) {
      qb.andWhere('vehiculo.activo = :activo', { activo: isActive });
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
        plate: `%${query.plate.trim().toUpperCase()}%`,
      });
    }

    const page = parsePositiveInt(query.page);
    const limit = parsePositiveInt(query.limit);
    if (page !== undefined || limit !== undefined) {
      const resolvedPage = page ?? 1;
      const resolvedLimit = limit ?? 20;
      qb.skip((resolvedPage - 1) * resolvedLimit).take(resolvedLimit);
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
      throw new NotFoundException('El vehículo no existe.');
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
            'Para registrar un vehículo inhabilitado (out_of_service) debe indicar un motivo descriptivo (mínimo 5 caracteres).',
        });
      }
    }

    const type = await this.tipoRepository.findOne({
      where: { id: dto.vehicleTypeId, activo: true },
    });
    if (!type) {
      throw new NotFoundException(
        'El tipo de vehículo no existe o está inactivo.',
      );
    }

    try {
      const saved = await this.dataSource.transaction(async (manager) => {
        await this.setAuditContext(manager, actorId, requestIp);
        const repository = manager.getRepository(Vehiculo);
        return repository.save(
          repository.create({
            tipoVehiculo: type,
            estado: dto.vehicleStatus,
            placa: dto.plate,
            capacidadKg: dto.capacityKg,
            capacidadYd3: dto.capacityYd3,
            activo: dto.isActive ?? true,
          }),
        );
      });

      return this.withAvailability(saved);
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un vehículo con esa placa.');
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
      await this.setAuditContext(manager, actorId, requestIp);
      const repository = manager.getRepository(Vehiculo);
      const vehicle = await repository.findOne({
        where: { id },
        relations: { tipoVehiculo: true },
      });
      if (!vehicle) {
        throw new NotFoundException('El vehículo no existe.');
      }

      assertValidStatusTransition({
        currentStatus: vehicle.estado,
        targetStatus: dto.vehicleStatus,
        reason: dto.reason,
      });

      vehicle.estado = dto.vehicleStatus;
      vehicle.actualizadoEn = new Date();

      return repository.save(vehicle);
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
        await this.setAuditContext(manager, actorId, requestIp);
        const repository = manager.getRepository(Vehiculo);
        const vehicle = await repository.findOne({
          where: { id },
          relations: { tipoVehiculo: true },
        });
        if (!vehicle) {
          throw new NotFoundException('El vehículo no existe.');
        }

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
              'El tipo de vehículo no existe o está inactivo.',
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

        return repository.save(vehicle);
      });

      return this.withAvailability(updated);
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un vehículo con esa placa.');
      throw error;
    }
  }

  private async setAuditContext(
    manager: EntityManager,
    actorId: string,
    requestIp: string,
  ): Promise<void> {
    if (typeof manager.query !== 'function') {
      return;
    }
    if (actorId) {
      await manager.query(`SELECT set_config('app.current_user_id', $1, true)`, [
        actorId,
      ]);
    }
    if (requestIp) {
      await manager.query(`SELECT set_config('app.request_ip', $1, true)`, [
        requestIp,
      ]);
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
