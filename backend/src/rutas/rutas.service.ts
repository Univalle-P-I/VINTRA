import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import type { FindOptionsWhere, Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { ActualizarBarrioDto } from './dto/actualizar-barrio.dto';
import { ActualizarMacrorutaDto } from './dto/actualizar-macroruta.dto';
import { ActualizarMicrorutaBarrioDto } from './dto/actualizar-microruta-barrio.dto';
import { ActualizarMicrorutaDto } from './dto/actualizar-microruta.dto';
import { ConsultarBarriosDto } from './dto/consultar-barrios.dto';
import { ConsultarMicrorutasDto } from './dto/consultar-microrutas.dto';
import { CrearBarrioDto } from './dto/crear-barrio.dto';
import { CrearMacrorutaDto } from './dto/crear-macroruta.dto';
import { CrearMicrorutaBarrioDto } from './dto/crear-microruta-barrio.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { Barrio } from './entidades/barrio.entity';
import { Macroruta } from './entidades/macroruta.entity';
import { MicrorutaBarrio } from './entidades/microruta-barrio.entity';
import { Microruta } from './entidades/microruta.entity';

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Barrio)
    private readonly barrioRepository: Repository<Barrio>,
    @InjectRepository(Macroruta)
    private readonly macrorutaRepository: Repository<Macroruta>,
    @InjectRepository(Microruta)
    private readonly microrutaRepository: Repository<Microruta>,
    @InjectRepository(MicrorutaBarrio)
    private readonly microrutaBarrioRepository: Repository<MicrorutaBarrio>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async listarBarrios(dto: ConsultarBarriosDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const where: FindOptionsWhere<Barrio> = {};
    if (dto.name) where.nombre = ILike(`%${dto.name}%`);
    if (dto.commune) where.comuna = ILike(`%${dto.commune}%`);
    const [items, total] = await this.barrioRepository.findAndCount({
      where: Object.keys(where).length ? where : {},
      order: { nombre: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async obtenerBarrio(id: string): Promise<Barrio> {
    const item = await this.barrioRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('El barrio no existe.');
    return item;
  }

  crearBarrio(dto: CrearBarrioDto, actorId: string, ip: string) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Barrio);
      try {
        return await repository.save(
          repository.create({
            comuna: dto.commune ?? null,
            nombre: dto.name,
            geometria: dto.geometry,
          }),
        );
      } catch (error) {
        this.throwIfUniqueViolation(error, 'Ya existe un barrio con ese nombre.');
        throw error;
      }
    });
  }

  async actualizarBarrio(
    id: string,
    dto: ActualizarBarrioDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Barrio);
      const item = await repository.findOne({ where: { id } });
      if (!item) throw new NotFoundException('El barrio no existe.');
      if (dto.commune !== undefined) item.comuna = dto.commune;
      if (dto.name !== undefined) item.nombre = dto.name;
      if (dto.geometry !== undefined) item.geometria = dto.geometry;
      try {
        return await repository.save(item);
      } catch (error) {
        this.throwIfUniqueViolation(error, 'Ya existe un barrio con ese nombre.');
        throw error;
      }
    });
  }

  listarMacrorutas(): Promise<Macroruta[]> {
    return this.macrorutaRepository.find({ order: { codigo: 'ASC' } });
  }

  async obtenerMacroruta(id: string): Promise<Macroruta> {
    const item = await this.macrorutaRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('La macroruta no existe.');
    return item;
  }

  crearMacroruta(dto: CrearMacrorutaDto, actorId: string, ip: string) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Macroruta);
      try {
        return await repository.save(
          repository.create({
            codigo: dto.code,
            nombre: dto.name,
            geometria: dto.geometry,
          }),
        );
      } catch (error) {
        this.throwIfUniqueViolation(error, 'Ya existe una macroruta con ese código.');
        throw error;
      }
    });
  }

  async actualizarMacroruta(
    id: string,
    dto: ActualizarMacrorutaDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Macroruta);
      const item = await repository.findOne({ where: { id } });
      if (!item) throw new NotFoundException('La macroruta no existe.');
      if (dto.code !== undefined) item.codigo = dto.code;
      if (dto.name !== undefined) item.nombre = dto.name;
      if (dto.geometry !== undefined) item.geometria = dto.geometry;
      try {
        return await repository.save(item);
      } catch (error) {
        this.throwIfUniqueViolation(error, 'Ya existe una macroruta con ese código.');
        throw error;
      }
    });
  }

  async listarMicrorutas(dto: ConsultarMicrorutasDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const query = this.microrutaRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.macroruta', 'macro')
      .orderBy('route.codigo', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (dto.macrorouteId) {
      query.andWhere('macro.id = :macrorouteId', {
        macrorouteId: dto.macrorouteId,
      });
    }
    if (dto.search) {
      query.andWhere(
        '(route.nombre ILIKE :search OR route.codigo ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }
    if (dto.includeGeometry === false) {
      query.select([
        'route.id',
        'route.codigo',
        'route.nombre',
        'route.actualizadoEn',
        'route.creadoEn',
        'macro.id',
        'macro.codigo',
        'macro.nombre',
      ]);
    }
    const [items, total] = await query.getManyAndCount();
    return { items, total, page, limit };
  }

  async obtenerMicroruta(id: string): Promise<Microruta> {
    const item = await this.microrutaRepository.findOne({
      where: { id },
      relations: { macroruta: true },
    });
    if (!item) throw new NotFoundException('La microruta no existe.');
    return item;
  }

  async crearMicroruta(
    dto: CrearMicrorutaDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const macro = await manager.getRepository(Macroruta).findOne({
        where: { id: dto.macrorouteId },
      });
      if (!macro) throw new NotFoundException('La macroruta no existe.');
      const repository = manager.getRepository(Microruta);
      try {
        return await repository.save(
          repository.create({
            macroruta: macro,
            codigo: dto.code,
            nombre: dto.name,
            geometria: dto.geometry,
          }),
        );
      } catch (error) {
        this.throwIfUniqueViolation(error, 'Ya existe una microruta con ese código.');
        throw error;
      }
    });
  }

  async actualizarMicroruta(
    id: string,
    dto: ActualizarMicrorutaDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Microruta);
      const item = await repository.findOne({ where: { id } });
      if (!item) throw new NotFoundException('La microruta no existe.');
      if (dto.macrorouteId !== undefined) {
        const macro = await manager.getRepository(Macroruta).findOne({
          where: { id: dto.macrorouteId },
        });
        if (!macro) throw new NotFoundException('La macroruta no existe.');
        item.macroruta = macro;
      }
      if (dto.code !== undefined) item.codigo = dto.code;
      if (dto.name !== undefined) item.nombre = dto.name;
      if (dto.geometry !== undefined) item.geometria = dto.geometry;
      try {
        return await repository.save(item);
      } catch (error) {
        this.throwIfUniqueViolation(error, 'Ya existe una microruta con ese código.');
        throw error;
      }
    });
  }

  listarBarriosMicroruta(microrouteId?: string) {
    return this.microrutaBarrioRepository.find({
      where: microrouteId ? { microruta: { id: microrouteId } } : {},
      relations: { microruta: true, barrio: true },
      order: { ordenVisita: 'ASC' },
    });
  }

  async crearMicrorutaBarrio(
    dto: CrearMicrorutaBarrioDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const microruta = await manager.getRepository(Microruta).findOne({
        where: { id: dto.microrouteId },
      });
      if (!microruta) throw new NotFoundException('La microruta no existe.');
      const barrio = await manager.getRepository(Barrio).findOne({
        where: { id: dto.neighborhoodId },
      });
      if (!barrio) throw new NotFoundException('El barrio no existe.');
      const repository = manager.getRepository(MicrorutaBarrio);
      try {
        return await repository.save(
          repository.create({
            microruta,
            barrio,
            ordenVisita: dto.orderVisit,
          }),
        );
      } catch (error) {
        this.throwIfUniqueViolation(
          error,
          'La microruta ya tiene ese barrio o número de orden.',
        );
        throw error;
      }
    });
  }

  async actualizarMicrorutaBarrio(
    id: string,
    dto: ActualizarMicrorutaBarrioDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(MicrorutaBarrio);
      const link = await repository.findOne({ where: { id } });
      if (!link) {
        throw new NotFoundException('La asociación microruta-barrio no existe.');
      }
      if (dto.microrouteId !== undefined) {
        const route = await manager.getRepository(Microruta).findOne({
          where: { id: dto.microrouteId },
        });
        if (!route) throw new NotFoundException('La microruta no existe.');
        link.microruta = route;
      }
      if (dto.neighborhoodId !== undefined) {
        const neighborhood = await manager.getRepository(Barrio).findOne({
          where: { id: dto.neighborhoodId },
        });
        if (!neighborhood) throw new NotFoundException('El barrio no existe.');
        link.barrio = neighborhood;
      }
      if (dto.orderVisit !== undefined) link.ordenVisita = dto.orderVisit;
      try {
        return await repository.save(link);
      } catch (error) {
        this.throwIfUniqueViolation(
          error,
          'La microruta ya tiene ese barrio o número de orden.',
        );
        throw error;
      }
    });
  }

  private throwIfUniqueViolation(error: unknown, message: string): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException(message);
    }
  }
}
