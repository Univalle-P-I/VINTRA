import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { translateDatabaseError } from './database-errors';
import type { CreateCrewMemberDto } from './dto/create-crew-member.dto';
import type { CreateDriverDto } from './dto/create-driver.dto';
import type { ListCrewMembersQueryDto } from './dto/list-crew-members-query.dto';
import type { ListDriversQueryDto } from './dto/list-drivers-query.dto';
import type { UpdateCrewMemberDto } from './dto/update-crew-member.dto';
import type { UpdateDriverDto } from './dto/update-driver.dto';
import { CrewMember } from './entities/crew-member.entity';
import { Driver } from './entities/driver.entity';

/**
 * CRUD de conductores y miembros de cuadrilla (VIN-024, #76).
 *
 * La baja es lógica (`is_active = false`) y se revierte con `isActive: true`.
 * La composición de cuadrillas, los turnos y la disponibilidad se implementan
 * en otro PR.
 */
@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Driver)
    protected readonly driverRepository: Repository<Driver>,
    @InjectRepository(CrewMember)
    protected readonly crewMemberRepository: Repository<CrewMember>,
  ) {}

  // ---------------------------------------------------------------- conductores

  async createDriver(dto: CreateDriverDto): Promise<Driver> {
    const driver = this.driverRepository.create({
      userAccountId: dto.userAccountId,
      crewId: dto.crewId ?? null,
      ...(dto.startedAt ? { startedAt: new Date(dto.startedAt) } : {}),
    });
    const saved = await this.saveDriver(driver);
    return this.findDriver(saved.id);
  }

  findDrivers(query: ListDriversQueryDto): Promise<Driver[]> {
    const where: FindOptionsWhere<Driver> = { isActive: query.isActive ?? true };
    if (query.crewId) {
      where.crewId = query.crewId;
    }
    return this.driverRepository.find({
      where,
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async findDriver(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findOneBy({ id });
    if (!driver) {
      throw new NotFoundException('El conductor no existe.');
    }
    return driver;
  }

  async updateDriver(id: string, dto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findDriver(id);
    if (dto.crewId !== undefined) {
      driver.crewId = dto.crewId;
    }
    if (dto.startedAt !== undefined) {
      driver.startedAt = new Date(dto.startedAt);
    }
    if (dto.endedAt !== undefined) {
      driver.endedAt = dto.endedAt === null ? null : new Date(dto.endedAt);
    }
    if (dto.isActive !== undefined) {
      driver.isActive = dto.isActive;
    }
    if (driver.endedAt && driver.endedAt < driver.startedAt) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la de inicio.',
      );
    }
    await this.saveDriver(driver);
    return this.findDriver(id);
  }

  deactivateDriver(id: string): Promise<Driver> {
    return this.updateDriver(id, { isActive: false });
  }

  private async saveDriver(driver: Driver): Promise<Driver> {
    try {
      return await this.driverRepository.save(driver);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  // ------------------------------------------------------- miembros de cuadrilla

  async createCrewMember(dto: CreateCrewMemberDto): Promise<CrewMember> {
    const member = this.crewMemberRepository.create({
      fullName: dto.fullName,
      crewId: dto.crewId ?? null,
    });
    const saved = await this.saveCrewMember(member);
    return this.findCrewMember(saved.id);
  }

  findCrewMembers(query: ListCrewMembersQueryDto): Promise<CrewMember[]> {
    const where: FindOptionsWhere<CrewMember> = {
      isActive: query.isActive ?? true,
    };
    if (query.crewId) {
      where.crewId = query.crewId;
    }
    return this.crewMemberRepository.find({
      where,
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async findCrewMember(id: string): Promise<CrewMember> {
    const member = await this.crewMemberRepository.findOneBy({ id });
    if (!member) {
      throw new NotFoundException('El miembro de cuadrilla no existe.');
    }
    return member;
  }

  async updateCrewMember(
    id: string,
    dto: UpdateCrewMemberDto,
  ): Promise<CrewMember> {
    const member = await this.findCrewMember(id);
    if (dto.fullName !== undefined) {
      member.fullName = dto.fullName;
    }
    if (dto.crewId !== undefined) {
      member.crewId = dto.crewId;
    }
    if (dto.isActive !== undefined) {
      member.isActive = dto.isActive;
    }
    await this.saveCrewMember(member);
    return this.findCrewMember(id);
  }

  deactivateCrewMember(id: string): Promise<CrewMember> {
    return this.updateCrewMember(id, { isActive: false });
  }

  private async saveCrewMember(member: CrewMember): Promise<CrewMember> {
    try {
      return await this.crewMemberRepository.save(member);
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }
}
