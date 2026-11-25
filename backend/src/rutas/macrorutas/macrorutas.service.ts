import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearMacrorutaDto } from './dto/crear-macroruta.dto';
import { Macroruta } from './entities/macroruta.entity';
import { lanzarErrorDeCreacionRuta } from '../errores-rutas';

@Injectable()
export class MacrorutasService {
  constructor(
    @InjectRepository(Macroruta)
    private readonly macrorutasRepository: Repository<Macroruta>,
  ) {}

  async crear(dto: CrearMacrorutaDto): Promise<Macroruta> {
    let id: string;
    try {
      const resultado = await this.macrorutasRepository
        .createQueryBuilder()
        .insert()
        .into(Macroruta)
        .values({
          nombre: dto.nombre,
          codigo: dto.codigo,
          activo: true,
          geom: () => 'ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326)',
        })
        .setParameter('geom', JSON.stringify(dto.geom))
        .returning('id')
        .execute();
      const idInsertado = resultado.raw?.[0]?.id;

      if (typeof idInsertado !== 'string') {
        throw new Error(
          'No se obtuvo el identificador de la macroruta creada.',
        );
      }

      id = idInsertado;
    } catch (error) {
      lanzarErrorDeCreacionRuta(
        error,
        'El código de la macroruta ya existe.',
      );
    }

    return this.obtener(id);
  }

  listar(): Promise<Macroruta[]> {
    return this.macrorutasRepository.find();
  }

  async obtener(id: string): Promise<Macroruta> {
    const { entities, raw } = await this.macrorutasRepository
      .createQueryBuilder('macroruta')
      .addSelect('ST_AsGeoJSON(macroruta.geom)::json', 'geom_json')
      .where('macroruta.id = :id', { id })
      .getRawAndEntities();
    const macroruta = entities[0];

    if (!macroruta) {
      throw new NotFoundException('Macroruta no encontrada.');
    }

    macroruta.geom = raw[0]?.geom_json;
    return macroruta;
  }
}
