import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { ActualizarCuadrillaDto } from './dto/actualizar-cuadrilla.dto';
import { ActualizarIntegranteCuadrillaDto } from './dto/actualizar-integrante-cuadrilla.dto';
import { CrearCuadrillaDto } from './dto/crear-cuadrilla.dto';
import { CrearIntegranteCuadrillaDto } from './dto/crear-integrante-cuadrilla.dto';
import { Cuadrilla } from './entidades/cuadrilla.entity';
import { IntegranteCuadrilla } from './entidades/integrante-cuadrilla.entity';

@Injectable()
export class CuadrillasService {
  constructor(
    @InjectRepository(Cuadrilla)
    private readonly cuadrillaRepository: Repository<Cuadrilla>,
    @InjectRepository(IntegranteCuadrilla)
    private readonly integranteRepository: Repository<IntegranteCuadrilla>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  listar(): Promise<Cuadrilla[]> {
    return this.cuadrillaRepository.find({ order: { nombre: 'ASC' } });
  }

  async obtener(id: string): Promise<Cuadrilla> {
    const crew = await this.cuadrillaRepository.findOne({ where: { id } });
    if (!crew) throw new NotFoundException('La cuadrilla no existe.');
    return crew;
  }

  crear(dto: CrearCuadrillaDto, actorId: string, ip: string) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Cuadrilla);
      return repository.save(repository.create({ nombre: dto.name, activo: true }));
    });
  }

  async actualizar(
    id: string,
    dto: ActualizarCuadrillaDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(Cuadrilla);
      const crew = await repository.findOne({ where: { id } });
      if (!crew) throw new NotFoundException('La cuadrilla no existe.');
      if (dto.name !== undefined) crew.nombre = dto.name;
      if (dto.isActive !== undefined) crew.activo = dto.isActive;
      return repository.save(crew);
    });
  }

  listarIntegrantes() {
    return this.integranteRepository.find({
      relations: { cuadrilla: true },
      order: { nombreCompleto: 'ASC' },
    });
  }

  crearIntegrante(dto: CrearIntegranteCuadrillaDto, actorId: string, ip: string) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const crewRepository = manager.getRepository(Cuadrilla);
      const crew = await crewRepository.findOne({
        where: { id: dto.crewId, activo: true },
      });
      if (!crew) {
        throw new NotFoundException('La cuadrilla no existe o está inactiva.');
      }
      const repository = manager.getRepository(IntegranteCuadrilla);
      return repository.save(
        repository.create({
          cuadrilla: crew,
          nombreCompleto: dto.fullName,
          activo: true,
        }),
      );
    });
  }

  async actualizarIntegrante(
    id: string,
    dto: ActualizarIntegranteCuadrillaDto,
    actorId: string,
    ip: string,
  ) {
    return this.contextoAuditoria.ejecutar(actorId, ip, async (manager) => {
      const repository = manager.getRepository(IntegranteCuadrilla);
      const member = await repository.findOne({
        where: { id },
        relations: { cuadrilla: true },
      });
      if (!member) throw new NotFoundException('El integrante no existe.');

      if (dto.crewId !== undefined) {
        if (dto.crewId === null) {
          member.cuadrilla = null;
        } else {
          const crew = await manager.getRepository(Cuadrilla).findOne({
            where: { id: dto.crewId, activo: true },
          });
          if (!crew) {
            throw new NotFoundException('La cuadrilla no existe o está inactiva.');
          }
          member.cuadrilla = crew;
        }
      }
      if (dto.fullName !== undefined) member.nombreCompleto = dto.fullName;
      if (dto.isActive !== undefined) member.activo = dto.isActive;
      return repository.save(member);
    });
  }
}
