import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { Barrio } from '../barrios/entities/barrios.entity';
import { Macroruta } from '../macrorutas/entities/macroruta.entity';
import { AsociarBarriosDto } from './dto/asociar-barrios.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { MicrorutaBarrio } from './entities/microruta-barrio.entity';
import { Microruta } from './entities/microruta.entity';

export type MicrorutaDetalle = Pick<
  Microruta,
  | 'id'
  | 'macroruta'
  | 'nombre'
  | 'codigo'
  | 'geom'
  | 'activo'
  | 'actualizadoEn'
  | 'creadoEn'
> & {
  barrios: MicrorutaBarrio[];
};

type MicrorutaCreada = Omit<MicrorutaDetalle, 'barrios'>;

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

  async crear(dto: CrearMicrorutaDto): Promise<MicrorutaCreada> {
    const macroruta = await this.macrorutasRepository.findOne({
      where: { id: dto.macrorutaId },
    });

    if (!macroruta) {
      throw new NotFoundException('Macroruta no encontrada.');
    }

    let id: string;
    try {
      const resultado = await this.microrutasRepository
        .createQueryBuilder()
        .insert()
        .into(Microruta)
        .values({
          nombre: dto.nombre,
          codigo: dto.codigo,
          macroruta: { id: dto.macrorutaId },
          activo: true,
          geom: () => 'ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326)',
        })
        .setParameter('geom', JSON.stringify(dto.geom))
        .returning('id')
        .execute();
      const idInsertado = resultado.raw?.[0]?.id;

      if (typeof idInsertado !== 'string') {
        throw new Error(
          'No se obtuvo el identificador de la microruta creada.',
        );
      }
      id = idInsertado;
    } catch (error) {
      this.lanzarErrorDeCreacion(error);
    }

    const { barrios: _barrios, ...creada } = await this.obtener(id);
    return creada;
  }

  listar(): Promise<Microruta[]> {
    return this.microrutasRepository.find();
  }

  async obtener(id: string): Promise<MicrorutaDetalle> {
    const { entities, raw } = await this.microrutasRepository
      .createQueryBuilder('microruta')
      .leftJoinAndSelect('microruta.macroruta', 'macroruta')
      .addSelect('ST_AsGeoJSON(microruta.geom)::json', 'geom_json')
      .where('microruta.id = :id', { id })
      .getRawAndEntities();
    const microruta = entities[0];

    if (!microruta) {
      throw new NotFoundException('Microruta no encontrada.');
    }

    microruta.geom = raw[0]?.geom_json;
    const barrios = await this.microrutaBarrioRepository.find({
      where: { microruta: { id } },
      relations: { barrio: true },
      order: { ordenVisita: 'ASC' },
    });

    return {
      id: microruta.id,
      macroruta: microruta.macroruta,
      nombre: microruta.nombre,
      codigo: microruta.codigo,
      geom: microruta.geom,
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
    const barriosSolicitados = dto.barrios.map(
      ({ barrioId, ordenVisita }) => ({
        barrioIdNormalizado: barrioId.toLowerCase(),
        ordenVisita,
      }),
    );
    const idsBarrios = barriosSolicitados.map(
      ({ barrioIdNormalizado }) => barrioIdNormalizado,
    );
    if (new Set(idsBarrios).size !== idsBarrios.length) {
      throw new BadRequestException({
        message: 'La solicitud contiene campos no válidos.',
        details: [
          {
            field: 'barrios',
            reason: 'No se puede repetir un barrio en la misma solicitud.',
          },
        ],
      });
    }

    const visitOrders = dto.barrios.map(({ ordenVisita }) => ordenVisita);
    if (new Set(visitOrders).size !== visitOrders.length) {
      throw new BadRequestException({
        message: 'La solicitud contiene campos no válidos.',
        details: [
          {
            field: 'barrios',
            reason:
              'No se puede repetir un orden de visita en la misma solicitud.',
          },
        ],
      });
    }

    const microruta = await this.microrutasRepository.findOne({
      where: { id },
    });

    if (!microruta) {
      throw new NotFoundException('Microruta no encontrada.');
    }

    const barrios = await this.barriosRepository.find({
      where: { id: In(idsBarrios) },
    });
    const barriosPorId = new Map(barrios.map((barrio) => [barrio.id, barrio]));

    if (idsBarrios.some((barrioId) => !barriosPorId.has(barrioId))) {
      throw new NotFoundException('Uno o más barrios no fueron encontrados.');
    }

    const barriosAsociados = await this.microrutaBarrioRepository.find({
      where: { microruta: { id }, barrio: { id: In(idsBarrios) } },
    });
    if (barriosAsociados.length > 0) {
      throw new ConflictException(
        'Uno o más barrios ya están asociados a la microruta.',
      );
    }

    const relaciones = barriosSolicitados.map(
      ({ barrioIdNormalizado, ordenVisita }) => {
        const barrio = barriosPorId.get(barrioIdNormalizado);
        if (!barrio) {
          throw new NotFoundException(
            'Uno o más barrios no fueron encontrados.',
          );
        }

        return this.microrutaBarrioRepository.create({
          microruta,
          barrio,
          ordenVisita,
        });
      },
    );

    try {
      await this.microrutaBarrioRepository.save(relaciones);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        if (error.driverError.constraint === 'uq_microroute_neighborhood') {
          throw new ConflictException(
            'Uno o más barrios ya están asociados a la microruta.',
          );
        }

        if (
          error.driverError.constraint === 'uq_microroute_neighborhood_order'
        ) {
          throw new ConflictException(
            'Uno o más órdenes de visita ya están en uso en la microruta.',
          );
        }
      }

      throw error;
    }

    return this.obtener(id);
  }

  private lanzarErrorDeCreacion(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const codigo = error.driverError.code;

      if (codigo === '23505') {
        throw new ConflictException('El código de la microruta ya existe.');
      }

      if (['22023', 'XX000', '22P02'].includes(codigo)) {
        throw new BadRequestException('geom no es un GeoJSON válido.');
      }
    }

    throw error;
  }
}
