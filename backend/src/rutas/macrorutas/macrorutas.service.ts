import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Macroruta } from './entities/macroruta.entity';


@Injectable()
export class MacrorutasService {
  constructor(
    @InjectRepository(Macroruta)
    private readonly macrorutasRepository: Repository<Macroruta>,
  ) {}
}
