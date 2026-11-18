import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalService } from '../personal/personal.service';
import { Crew } from './entities/crew.entity';

/**
 * Estructura inicial (#127): sin lógica de negocio.
 * La composición de cuadrillas y la disponibilidad se implementan en VIN-024 (#76).
 */
@Injectable()
export class CuadrillasService {
  constructor(
    @InjectRepository(Crew)
    protected readonly crewRepository: Repository<Crew>,
    // Dependencia de Cuadrillas respecto al personal operativo.
    protected readonly personalService: PersonalService,
  ) {}
}
