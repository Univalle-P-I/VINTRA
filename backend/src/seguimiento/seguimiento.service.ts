import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePosition } from './entities/vehicle-position.entity';

/**
 * Estructura inicial (#131): sin lógica de negocio.
 * La captura y la consulta de posiciones GPS se implementan después.
 */
@Injectable()
export class SeguimientoService {
  constructor(
    @InjectRepository(VehiclePosition)
    protected readonly vehiclePositionRepository: Repository<VehiclePosition>,
  ) {}
}