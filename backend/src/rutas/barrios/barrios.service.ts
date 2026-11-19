import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barrio } from './entities/barrios.entity';

@Injectable()
export class BarriosService {
  constructor(
    @InjectRepository(Barrio)
    private readonly barriosRepository: Repository<Barrio>,
  ) {}

  listar(): Promise<Barrio[]> {
    return this.barriosRepository.find();
  }

  async obtener(id: string): Promise<Barrio> {
    const barrio = await this.barriosRepository.findOne({
      where: { id },
    });

    if (!barrio) {
      throw new NotFoundException('Barrio no encontrado.');
    }

    return barrio;
  }
}
