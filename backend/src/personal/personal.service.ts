import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrewMember } from './entities/crew-member.entity';
import { Driver } from './entities/driver.entity';

/**
 * Estructura inicial (#127): sin lógica de negocio.
 * El CRUD y la disponibilidad se implementan en VIN-024 (#76).
 */
@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Driver)
    protected readonly driverRepository: Repository<Driver>,
    @InjectRepository(CrewMember)
    protected readonly crewMemberRepository: Repository<CrewMember>,
  ) {}
}
