import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearMacrorutaDto } from './dto/crear-macroruta.dto';
import { Macroruta } from './entities/macroruta.entity';

@Injectable()
export class MacrorutasService {
  constructor(
    @InjectRepository(Macroruta)
    private readonly macrorutasRepository: Repository<Macroruta>,
  ) {}

  crear(dto: CrearMacrorutaDto): Promise<Macroruta> {
    const ahora = new Date();
    const macroruta = this.macrorutasRepository.create({
      nombre: dto.nombre,
      activo: true,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });

    return this.macrorutasRepository.save(macroruta);
  }

  listar(): Promise<Macroruta[]> {
    return this.macrorutasRepository.find();
  }

  async obtener(id: string): Promise<Macroruta> {
    const macroruta = await this.macrorutasRepository.findOne({
      where: { id },
    });

    if (!macroruta) {
      throw new NotFoundException('Macroruta no encontrada.');
    }

    return macroruta;
  }
}
