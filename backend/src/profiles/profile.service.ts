import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create.profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async create(userAccountId: string, dto: CreateProfileDto): Promise<Profile> {
    if (await this.profileRepo.exists({ where: { id: userAccountId } })) {
      throw new ConflictException('Esta cuenta ya tiene un perfil');
    }
    if (await this.profileRepo.exists({ where: { email: dto.email } })) {
      throw new ConflictException('El correo ya está registrado');
    }

    const profile = this.profileRepo.create({ id: userAccountId, ...dto });
    return this.profileRepo.save(profile);
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Perfil no encontrado');
    return profile;
  }

  async deactivate(id: string): Promise<void> {
    const profile = await this.findOne(id);
    profile.isActive = false;
    await this.profileRepo.save(profile);
  }
}