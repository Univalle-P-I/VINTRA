import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MicrorutaBarrio } from './entities/microruta-barrio.entity';
import { Microruta } from './entities/microruta.entity';

@Injectable()
export class MicrorutasService {
  constructor(
    @InjectRepository(Microruta)
    private readonly microrutasRepository: Repository<Microruta>,
    @InjectRepository(MicrorutaBarrio)
    private readonly microrutaBarrioRepository: Repository<MicrorutaBarrio>,
  ) {}
}
