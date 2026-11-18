import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalService } from '../personal/personal.service';
import { Cuadrilla } from './entities/cuadrilla.entity';

/**
 * Estructura inicial (#127): sin lógica de negocio.
 * La composición de cuadrillas y la disponibilidad se implementan en VIN-024 (#76).
 */
@Injectable()
export class CuadrillasService {
  constructor(
    @InjectRepository(Cuadrilla)
    protected readonly cuadrillasRepository: Repository<Cuadrilla>,
    // Dependencia de Cuadrillas respecto al personal operativo.
    protected readonly personalService: PersonalService,
  ) {}
}
