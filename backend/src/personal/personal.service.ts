import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Cuadrilla } from '../cuadrillas/entidades/cuadrilla.entity';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CrearUsuarioInternoDto } from '../usuarios/dto/crear-usuario-interno.dto';
import { DatosUsuario } from '../usuarios/entidades/datos-usuario.entity';
import { ActualizarConductorDto } from './dto/actualizar-conductor.dto';
import { CrearConductorDto } from './dto/crear-conductor.dto';
import { Conductor } from './entidades/conductor.entity';

export interface ConductorPublico {
  id: string;
  userDataId: string;
  crewId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  startedAt: Date;
  endedAt: Date | null;
  isActive: boolean;
}

@Injectable()
export class PersonalService {
  constructor(
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
    private readonly usuariosService: UsuariosService,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async listar(): Promise<ConductorPublico[]> {
    const drivers = await this.conductorRepository.find({
      relations: { datosUsuario: true, cuadrilla: true },
      order: { inicioVinculacion: 'DESC' },
    });
    return drivers.map((driver) => this.toPublic(driver));
  }

  async obtener(id: string): Promise<ConductorPublico> {
    const driver = await this.conductorRepository.findOne({
      where: { id },
      relations: { datosUsuario: true, cuadrilla: true },
    });
    if (!driver) throw new NotFoundException('El conductor no existe.');
    return this.toPublic(driver);
  }

  async obtenerPropio(userDataId: string): Promise<ConductorPublico> {
    const driver = await this.conductorRepository.findOne({
      where: { datosUsuario: { id: userDataId } },
      relations: { datosUsuario: true, cuadrilla: true },
    });
    if (!driver) throw new NotFoundException('El conductor no existe.');
    return this.toPublic(driver);
  }

  async crear(
    dto: CrearConductorDto,
    actorId: string,
    requestIp: string,
  ): Promise<ConductorPublico> {
    const userDto: CrearUsuarioInternoDto = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      documentType: dto.documentType,
      documentId: dto.documentId,
      role: RolUsuario.DRIVER,
      password: dto.password,
    };

    try {
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        async (manager) => {
          let crew: Cuadrilla | null = null;
          if (dto.crewId) {
            crew = await manager.getRepository(Cuadrilla).findOne({
              where: { id: dto.crewId, activo: true },
            });
            if (!crew) {
              throw new NotFoundException(
                'La cuadrilla no existe o está inactiva.',
              );
            }
          }

          const createdUser = await this.usuariosService.crearEntidades(
            manager,
            userDto,
          );
          const repository = manager.getRepository(Conductor);
          const driver = await repository.save(
            repository.create({
              datosUsuario: createdUser.data,
              cuadrilla: crew,
              activo: true,
              finVinculacion: null,
            }),
          );
          return this.toPublic(driver, createdUser.data);
        },
      );
    } catch (error) {
      this.throwIfUniqueViolation(error);
      throw error;
    }
  }

  async actualizar(
    id: string,
    dto: ActualizarConductorDto,
    actorId: string,
    requestIp: string,
  ): Promise<ConductorPublico> {
    try {
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        async (manager) => {
          const repository = manager.getRepository(Conductor);
          const driver = await repository.findOne({
            where: { id },
            relations: { datosUsuario: true, cuadrilla: true },
          });
          if (!driver) throw new NotFoundException('El conductor no existe.');

          if (dto.firstName !== undefined) {
            driver.datosUsuario.nombres = dto.firstName;
          }
          if (dto.lastName !== undefined) {
            driver.datosUsuario.apellidos = dto.lastName;
          }
          if (dto.email !== undefined) {
            driver.datosUsuario.correo = dto.email;
          }
          if (dto.phone !== undefined) {
            driver.datosUsuario.telefono = dto.phone;
          }
          if (dto.crewId !== undefined) {
            if (dto.crewId === null) {
              driver.cuadrilla = null;
            } else {
              const crew = await manager.getRepository(Cuadrilla).findOne({
                where: { id: dto.crewId, activo: true },
              });
              if (!crew) {
                throw new NotFoundException(
                  'La cuadrilla no existe o está inactiva.',
                );
              }
              driver.cuadrilla = crew;
            }
          }
          if (dto.isActive !== undefined) driver.activo = dto.isActive;

          await manager.getRepository(DatosUsuario).save(driver.datosUsuario);
          const saved = await repository.save(driver);
          return this.toPublic(saved);
        },
      );
    } catch (error) {
      this.throwIfUniqueViolation(error);
      throw error;
    }
  }

  private toPublic(
    driver: Conductor,
    data: DatosUsuario = driver.datosUsuario,
  ): ConductorPublico {
    return {
      id: driver.id,
      userDataId: data.id,
      crewId: driver.cuadrilla?.id ?? null,
      firstName: data.nombres,
      lastName: data.apellidos,
      email: data.correo,
      phone: data.telefono,
      startedAt: driver.inicioVinculacion,
      endedAt: driver.finVinculacion,
      isActive: driver.activo,
    };
  }

  private throwIfUniqueViolation(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException(
        'El correo o documento ya está asociado a otro usuario.',
      );
    }
  }
}
