import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Barrio } from '../barrios/entities/barrios.entity';
import { Macroruta } from '../macrorutas/entities/macroruta.entity';
import { AsociarBarriosDto } from './dto/asociar-barrios.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { MicrorutaBarrio } from './entities/microruta-barrio.entity';
import { Microruta } from './entities/microruta.entity';

export type MicrorutaDetalle = Pick<
  Microruta,
  'id' | 'macroruta' | 'nombre' | 'activo' | 'actualizadoEn' | 'creadoEn'
> & {
  barrios: MicrorutaBarrio[];
};

@Injectable()
export class MicrorutasService {
  constructor(
    @InjectRepository(Microruta)
    private readonly microrutasRepository: Repository<Microruta>,
    @InjectRepository(MicrorutaBarrio)
    private readonly microrutaBarrioRepository: Repository<MicrorutaBarrio>,
    @InjectRepository(Macroruta)
    private readonly macrorutasRepository: Repository<Macroruta>,
    @InjectRepository(Barrio)
    private readonly barriosRepository: Repository<Barrio>,
  ) {}

  async crear(dto: CrearMicrorutaDto): Promise<Microruta> {
    const macroruta = await this.macrorutasRepository.findOne({
      where: { id: dto.macrorutaId },
    });

    if (!macroruta) {
      throw new NotFoundException('Macroruta no encontrada.');
    }

    const ahora = new Date();
    const microruta = this.microrutasRepository.create({
      nombre: dto.nombre,
      macroruta,
      activo: true,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });

    return this.microrutasRepository.save(microruta);
  }

  listar(): Promise<Microruta[]> {
    return this.microrutasRepository.find();
  }

  async obtener(id: string): Promise<MicrorutaDetalle> {
    const microruta = await this.microrutasRepository.findOne({
      where: { id },
      relations: { macroruta: true },
    });

    if (!microruta) {
      throw new NotFoundException('Microruta no encontrada.');
    }

    const barrios = await this.microrutaBarrioRepository.find({
      where: { microruta: { id } },
      relations: { barrio: true },
      order: { ordenVisita: 'ASC' },
    });

    return {
      id: microruta.id,
      macroruta: microruta.macroruta,
      nombre: microruta.nombre,
      activo: microruta.activo,
      actualizadoEn: microruta.actualizadoEn,
      creadoEn: microruta.creadoEn,
      barrios: barrios.sort((a, b) => a.ordenVisita - b.ordenVisita),
    };
  }

  async asociarBarrios(
    id: string,
    dto: AsociarBarriosDto,
  ): Promise<MicrorutaDetalle> {
    const microruta = await this.microrutasRepository.findOne({
      where: { id },
    });

    if (!microruta) {
      throw new NotFoundException('Microruta no encontrada.');
    }

    const idsBarrios = [...new Set(dto.barrios.map(({ barrioId }) => barrioId))];
    const barrios = await this.barriosRepository.find({
      where: { id: In(idsBarrios) },
    });
    const barriosPorId = new Map(barrios.map((barrio) => [barrio.id, barrio]));

    if (idsBarrios.some((barrioId) => !barriosPorId.has(barrioId))) {
      throw new NotFoundException('Uno o más barrios no fueron encontrados.');
    }

    const relaciones = dto.barrios.map(({ barrioId, ordenVisita }) => {
      const barrio = barriosPorId.get(barrioId);
      if (!barrio) {
        throw new NotFoundException('Uno o más barrios no fueron encontrados.');
      }

      return this.microrutaBarrioRepository.create({
        microruta,
        barrio,
        ordenVisita,
      });
    });

    await this.microrutaBarrioRepository.save(relaciones);
    return this.obtener(id);
  }
}
