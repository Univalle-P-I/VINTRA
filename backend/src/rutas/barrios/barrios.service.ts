import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barrio } from './entities/barrios.entity';


@Injectable()
export class BarriosService {
  constructor(
    @InjectRepository(Barrio)
    private readonly barriosRepository: Repository<Barrio>,
  ) {}
}
