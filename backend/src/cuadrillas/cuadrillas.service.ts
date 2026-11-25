import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalService } from '../personal/personal.service';
import type { CreateCrewDto } from './dto/create-crew.dto';
import type { ListCrewsQueryDto } from './dto/list-crews-query.dto';
import type { UpdateCrewDto } from './dto/update-crew.dto';
import { Crew } from './entities/crew.entity';

/**
 * CRUD de cuadrillas (VIN-024, #76).
 *
 * La baja es lógica (`is_active = false`) y se revierte con `isActive: true`.
 * La composición de cuadrillas y la disponibilidad se implementan en otro PR.
 */
@Injectable()
export class CuadrillasService {
  constructor(
    @InjectRepository(Crew)
    protected readonly crewRepository: Repository<Crew>,
    // Dependencia de Cuadrillas respecto al personal operativo.
    protected readonly personalService: PersonalService,
  ) {}

  async createCrew(dto: CreateCrewDto): Promise<Crew> {
    const saved = await this.crewRepository.save(
      this.crewRepository.create({ name: dto.name }),
    );
    return this.findCrew(saved.id);
  }

  findCrews(query: ListCrewsQueryDto): Promise<Crew[]> {
    return this.crewRepository.find({
      where: { isActive: query.isActive ?? true },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async findCrew(id: string): Promise<Crew> {
    const crew = await this.crewRepository.findOneBy({ id });
    if (!crew) {
      throw new NotFoundException('La cuadrilla no existe.');
    }
    return crew;
  }

  async updateCrew(id: string, dto: UpdateCrewDto): Promise<Crew> {
    const crew = await this.findCrew(id);
    if (dto.name !== undefined) {
      crew.name = dto.name;
    }
    if (dto.isActive !== undefined) {
      crew.isActive = dto.isActive;
    }
    await this.crewRepository.save(crew);
    return this.findCrew(id);
  }

  deactivateCrew(id: string): Promise<Crew> {
    return this.updateCrew(id, { isActive: false });
  }
}
