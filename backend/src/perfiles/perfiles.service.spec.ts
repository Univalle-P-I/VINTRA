import { ConflictException, NotFoundException } from '@nestjs/common';
import type { EntityManager, Repository } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { CuentaUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { Perfil, RolUsuario } from './entidades/perfil.entity';
import { CrearPerfilDto } from './dto/crear-perfil.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { PerfilesService } from './perfiles.service';

const ACTOR_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
const REQUEST_IP = '192.0.2.10';
const ACCOUNT_ID = 'c0a80101-0000-4000-8000-000000000001';
const PROFILE_ID = 'c0a80101-0000-4000-8000-000000000002';
const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');

function createManager(repositories: Map<Function, object>) {
  return {
    getRepository: jest.fn((entity: Function) => repositories.get(entity)),
  };
}

function createAuditContext(manager: object) {
  return {
    ejecutar: jest.fn(
      async (
        _actorId: string,
        _requestIp: string,
        operation: (transactionManager: EntityManager) => Promise<unknown>,
      ) => operation(manager as unknown as EntityManager),
    ),
  };
}

function createService(
  profileRepository: object = {},
  accountRepository: object = {},
  auditContext: object = {},
): PerfilesService {
  return new PerfilesService(
    profileRepository as unknown as Repository<Perfil>,
    accountRepository as unknown as Repository<CuentaUsuario>,
    auditContext as unknown as ContextoAuditoriaService,
  );
}

describe('PerfilesService', () => {
  describe('listarPorCuenta', () => {
    it('returns public profiles ordered by creation time', async () => {
      const profiles = [
        {
          id: PROFILE_ID,
          cuentaUsuario: { id: ACCOUNT_ID },
          rol: RolUsuario.DRIVER,
          activo: true,
          creadoEn: CREATED_AT,
        },
      ];
      const profileRepository = {
        find: jest.fn().mockResolvedValue(profiles),
      };
      const service = createService(profileRepository);

      await expect(service.listarPorCuenta(ACCOUNT_ID)).resolves.toEqual([
        {
          id: PROFILE_ID,
          userAccountId: ACCOUNT_ID,
          role: RolUsuario.DRIVER,
          isActive: true,
          createdAt: CREATED_AT,
        },
      ]);
      expect(profileRepository.find).toHaveBeenCalledWith({
        where: { cuentaUsuario: { id: ACCOUNT_ID } },
        order: { creadoEn: 'ASC' },
      });
    });
  });

  describe('crear', () => {
    const dto: CrearPerfilDto = {
      userAccountId: ACCOUNT_ID,
      role: RolUsuario.OPERATIONS_MANAGER,
    };

    it('requires an existing account and creates an active profile transactionally', async () => {
      const account = { id: ACCOUNT_ID };
      const accountRepository = {
        findOneBy: jest.fn().mockResolvedValue(account),
      };
      const profile = {
        id: PROFILE_ID,
        cuentaUsuario: account,
        rol: dto.role,
        activo: true,
        creadoEn: CREATED_AT,
      };
      const profileRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue(profile),
      };
      const manager = createManager(
        new Map<Function, object>([[Perfil, profileRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, accountRepository, auditContext);

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).resolves.toEqual({
        id: PROFILE_ID,
        userAccountId: ACCOUNT_ID,
        role: RolUsuario.OPERATIONS_MANAGER,
        isActive: true,
        createdAt: CREATED_AT,
      });

      expect(accountRepository.findOneBy).toHaveBeenCalledWith({
        id: ACCOUNT_ID,
      });
      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(manager.getRepository).toHaveBeenCalledWith(Perfil);
      expect(profileRepository.create).toHaveBeenCalledWith({
        cuentaUsuario: account,
        rol: RolUsuario.OPERATIONS_MANAGER,
        activo: true,
      });
    });

    it('throws NotFoundException when the account does not exist', async () => {
      const accountRepository = {
        findOneBy: jest.fn().mockResolvedValue(null),
      };
      const auditContext = { ejecutar: jest.fn() };
      const service = createService({}, accountRepository, auditContext);

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
        new NotFoundException('La cuenta de usuario no existe.'),
      );
      expect(auditContext.ejecutar).not.toHaveBeenCalled();
    });

    it('translates a PostgreSQL unique violation to ConflictException', async () => {
      const account = { id: ACCOUNT_ID };
      const accountRepository = {
        findOneBy: jest.fn().mockResolvedValue(account),
      };
      const profileRepository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const manager = createManager(
        new Map<Function, object>([[Perfil, profileRepository]]),
      );
      const service = createService(
        {},
        accountRepository,
        createAuditContext(manager),
      );

      await expect(service.crear(dto, ACTOR_ID, REQUEST_IP)).rejects.toThrow(
        new ConflictException('La cuenta ya tiene un perfil con ese rol.'),
      );
    });
  });

  describe('actualizar', () => {
    it('updates the active state and returns the public profile shape', async () => {
      const profile = {
        id: PROFILE_ID,
        cuentaUsuario: { id: ACCOUNT_ID },
        rol: RolUsuario.DRIVER,
        activo: true,
        creadoEn: CREATED_AT,
      };
      const profileRepository = {
        findOne: jest.fn().mockResolvedValue(profile),
        save: jest.fn(async (value) => value),
      };
      const manager = createManager(
        new Map<Function, object>([[Perfil, profileRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = createService({}, {}, auditContext);
      const dto: ActualizarPerfilDto = { isActive: false };

      await expect(
        service.actualizar(PROFILE_ID, dto, ACTOR_ID, REQUEST_IP),
      ).resolves.toEqual({
        id: PROFILE_ID,
        userAccountId: ACCOUNT_ID,
        role: RolUsuario.DRIVER,
        isActive: false,
        createdAt: CREATED_AT,
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        ACTOR_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { id: PROFILE_ID },
        relations: { cuentaUsuario: true },
      });
      expect(profileRepository.save).toHaveBeenCalledWith(profile);
    });

    it('throws NotFoundException when the profile does not exist', async () => {
      const profileRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[Perfil, profileRepository]]),
      );
      const service = createService({}, {}, createAuditContext(manager));

      await expect(
        service.actualizar(
          PROFILE_ID,
          { isActive: false },
          ACTOR_ID,
          REQUEST_IP,
        ),
      ).rejects.toThrow(new NotFoundException('El perfil no existe.'));
      expect(profileRepository.save).not.toHaveBeenCalled();
    });
  });
});
