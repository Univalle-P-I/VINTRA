import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { ActualizarTipoVehiculoDto } from './dto/actualizar-tipo-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';
import { CrearTipoVehiculoDto } from './dto/crear-tipo-vehiculo.dto';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { TipoVehiculo } from './entidades/tipo-vehiculo.entity';
import { Vehiculo } from './entidades/vehiculo.entity';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(TipoVehiculo)
    private readonly tipoRepository: Repository<TipoVehiculo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

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
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        (manager) => {
          const repository = manager.getRepository(TipoVehiculo);
          return repository.save(
            repository.create({
              codigo: dto.code,
              nombre: dto.name,
              activo: dto.isActive ?? true,
            }),
          );
        },
      );
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
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        async (manager) => {
          const repository = manager.getRepository(TipoVehiculo);
          const type = await repository.findOneBy({ id });
          if (!type) {
            throw new NotFoundException('El tipo de vehículo no existe.');
          }
          if (dto.code !== undefined) type.codigo = dto.code;
          if (dto.name !== undefined) type.nombre = dto.name;
          if (dto.isActive !== undefined) type.activo = dto.isActive;
          return repository.save(type);
        },
      );
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un tipo con ese código.');
      throw error;
    }
  }

  listar(): Promise<Vehiculo[]> {
    return this.vehiculoRepository.find({
      where: { activo: true },
      relations: { tipoVehiculo: true },
      order: { placa: 'ASC' },
    });
  }

  async obtener(id: string): Promise<Vehiculo> {
    const vehicle = await this.vehiculoRepository.findOne({
      where: { id },
      relations: { tipoVehiculo: true },
    });
    if (!vehicle) {
      throw new NotFoundException('El vehículo no existe.');
    }
    return vehicle;
  }

  async crear(
    dto: CrearVehiculoDto,
    actorId: string,
    requestIp: string,
  ): Promise<Vehiculo> {
    const type = await this.tipoRepository.findOne({
      where: { id: dto.vehicleTypeId, activo: true },
    });
    if (!type) {
      throw new NotFoundException('El tipo de vehículo no existe o está inactivo.');
    }

    try {
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        (manager) => {
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
        },
      );
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un vehículo con esa placa.');
      throw error;
    }
  }

  async actualizar(
    id: string,
    dto: ActualizarVehiculoDto,
    actorId: string,
    requestIp: string,
  ): Promise<Vehiculo> {
    try {
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        async (manager) => {
          const repository = manager.getRepository(Vehiculo);
          const vehicle = await repository.findOne({
            where: { id },
            relations: { tipoVehiculo: true },
          });
          if (!vehicle) {
            throw new NotFoundException('El vehículo no existe.');
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
          if (dto.vehicleStatus !== undefined) {
            vehicle.estado = dto.vehicleStatus;
          }
          if (dto.plate !== undefined) vehicle.placa = dto.plate;
          if (dto.capacityKg !== undefined) {
            vehicle.capacidadKg = dto.capacityKg;
          }
          if (dto.capacityYd3 !== undefined) {
            vehicle.capacidadYd3 = dto.capacityYd3;
          }
          if (dto.isActive !== undefined) vehicle.activo = dto.isActive;

          return repository.save(vehicle);
        },
      );
    } catch (error) {
      this.throwIfUniqueViolation(error, 'Ya existe un vehículo con esa placa.');
      throw error;
    }
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
