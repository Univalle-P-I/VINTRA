import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal } from './entities/personal.entity';

/**
 * Estructura inicial (#127): sin lógica de negocio.
 * El CRUD y la disponibilidad se implementan en VIN-024 (#76).
 */
@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Personal)
    protected readonly personalRepository: Repository<Personal>,
  ) {}
}
