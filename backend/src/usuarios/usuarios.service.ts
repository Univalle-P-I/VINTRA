import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import type { EntityManager, Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Perfil } from '../perfiles/entidades/perfil.entity';
import {
  CuentaUsuario,
  EstadoUsuario,
} from './entidades/cuenta-usuario.entity';
import { DatosUsuario } from './entidades/datos-usuario.entity';
import { CrearUsuarioInternoDto } from './dto/crear-usuario-interno.dto';
import { ActualizarDatosUsuarioDto } from './dto/actualizar-datos-usuario.dto';

export interface UsuarioPublico {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: EstadoUsuario;
  roles: string[];
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(CuentaUsuario)
    private readonly cuentaRepository: Repository<CuentaUsuario>,
    @InjectRepository(DatosUsuario)
    private readonly datosRepository: Repository<DatosUsuario>,
    private readonly contextoAuditoria: ContextoAuditoriaService,
  ) {}

  async crear(
    dto: CrearUsuarioInternoDto,
    actorId: string,
    requestIp: string,
  ): Promise<UsuarioPublico> {
    try {
      return await this.contextoAuditoria.ejecutar(
        actorId,
        requestIp,
        async (manager) => {
          const created = await this.crearEntidades(manager, dto);
          return this.toPublic(created.data, created.account, [created.role]);
        },
      );
    } catch (error) {
      this.throwIfUniqueViolation(error);
      throw error;
    }
  }

  async crearEntidades(
    manager: EntityManager,
    dto: CrearUsuarioInternoDto,
  ): Promise<{ account: CuentaUsuario; data: DatosUsuario; role: string }> {
    const accountRepository = manager.getRepository(CuentaUsuario);
    const dataRepository = manager.getRepository(DatosUsuario);
    const profileRepository = manager.getRepository(Perfil);
    const now = new Date();
    const account = await accountRepository.save(
      accountRepository.create({
        estado: EstadoUsuario.ACTIVO,
        tipoDocumento: dto.documentType,
        numeroDocumento: dto.documentId,
        hashContrasena: await argon2.hash(dto.password, {
          type: argon2.argon2id,
        }),
        intentosFallidos: 0,
        bloqueadoHasta: null,
        ultimoInicioSesion: null,
        contrasenaActualizadaEn: now,
      }),
    );
    const data = await dataRepository.save(
      dataRepository.create({
        id: account.id,
        nombres: dto.firstName,
        apellidos: dto.lastName,
        correo: dto.email,
        telefono: dto.phone ?? null,
        correoVerificadoEn: null,
        cuentaUsuario: account,
      }),
    );
    const profile = await profileRepository.save(
      profileRepository.create({
        cuentaUsuario: account,
        rol: dto.role,
        activo: true,
      }),
    );

    return { account, data, role: profile.rol };
  }

  async listar(): Promise<UsuarioPublico[]> {
    const records = await this.datosRepository.find({
      relations: { cuentaUsuario: true },
      order: { apellidos: 'ASC', nombres: 'ASC' },
    });

    return Promise.all(
      records.map(async (data) => {
        const profiles = await this.cuentaRepository.manager
          .getRepository(Perfil)
          .find({
            where: { cuentaUsuario: { id: data.id }, activo: true },
          });
        return this.toPublic(data, data.cuentaUsuario, profiles.map((p) => p.rol));
      }),
    );
  }

  async obtener(id: string): Promise<UsuarioPublico> {
    const data = await this.datosRepository.findOne({
      where: { id },
      relations: { cuentaUsuario: true },
    });
    if (!data?.cuentaUsuario) {
      throw new NotFoundException('El usuario no existe.');
    }

    const profiles = await this.cuentaRepository.manager
      .getRepository(Perfil)
      .find({ where: { cuentaUsuario: { id }, activo: true } });
    return this.toPublic(data, data.cuentaUsuario, profiles.map((p) => p.rol));
  }

  async obtenerPropio(id: string): Promise<UsuarioPublico> {
    return this.obtener(id);
  }

  async actualizarPropio(
    id: string,
    dto: ActualizarDatosUsuarioDto,
    actorId: string,
    requestIp: string,
  ): Promise<UsuarioPublico> {
    return this.contextoAuditoria.ejecutar(
      actorId,
      requestIp,
      async (manager) => {
        const repository = manager.getRepository(DatosUsuario);
        const data = await repository.findOne({
          where: { id },
          relations: { cuentaUsuario: true },
        });
        if (!data?.cuentaUsuario) {
          throw new NotFoundException('El usuario no existe.');
        }

        if (dto.firstName !== undefined) data.nombres = dto.firstName;
        if (dto.lastName !== undefined) data.apellidos = dto.lastName;
        if (dto.email !== undefined) data.correo = dto.email;
        if (dto.phone !== undefined) data.telefono = dto.phone;

        const saved = await repository.save(data);
        const profiles = await manager.getRepository(Perfil).find({
          where: { cuentaUsuario: { id }, activo: true },
        });
        return this.toPublic(
          saved,
          data.cuentaUsuario,
          profiles.map((p) => p.rol),
        );
      },
    );
  }

  private toPublic(
    data: DatosUsuario,
    account: CuentaUsuario,
    roles: string[],
  ): UsuarioPublico {
    return {
      id: account.id,
      firstName: data.nombres,
      lastName: data.apellidos,
      email: data.correo,
      phone: data.telefono,
      status: account.estado,
      roles,
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
