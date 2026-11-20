import * as argon2 from 'argon2';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import {
  createAuditContext,
  createManager,
} from '../../test/helpers/audit-mocks';
import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import { Perfil, RolUsuario } from '../perfiles/entidades/perfil.entity';
import {
  CuentaUsuario,
  EstadoUsuario,
  TipoDocumento,
} from './entidades/cuenta-usuario.entity';
import { DatosUsuario } from './entidades/datos-usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  it('creates account, user data and profile transactionally without exposing password hash', async () => {
    const id = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
    const accountRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ ...value, id })),
    };
    const dataRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const profileRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };
    const repositories = new Map([
      [CuentaUsuario, accountRepository],
      [DatosUsuario, dataRepository],
      [Perfil, profileRepository],
    ]);
    const manager = {
      getRepository: (entity: Function) => repositories.get(entity),
    };
    const auditContext = {
      ejecutar: jest.fn(
        async (
          _actorId: string,
          _ip: string,
          operation: (transactionManager: EntityManager) => Promise<unknown>,
        ) => operation(manager as unknown as EntityManager),
      ),
    };
    const service = new UsuariosService(
      {} as never,
      {} as never,
      auditContext as unknown as ContextoAuditoriaService,
    );

    const response = await service.crear(
      {
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: '3001234567',
        documentType: TipoDocumento.CC,
        documentId: '1234567890',
        role: RolUsuario.DRIVER,
        password: 'a-secure-password',
      },
      id,
      '192.0.2.10',
    );
    const savedAccount = accountRepository.save.mock.calls[0][0];

    expect(auditContext.ejecutar).toHaveBeenCalledWith(
      id,
      '192.0.2.10',
      expect.any(Function),
    );
    await expect(
      argon2.verify(savedAccount.hashContrasena, 'a-secure-password'),
    ).resolves.toBe(true);
    expect(savedAccount.hashContrasena).not.toBe('a-secure-password');
    expect(response).toEqual({
      id,
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      phone: '3001234567',
      status: 'active',
      roles: [RolUsuario.DRIVER],
    });
    expect(response).not.toHaveProperty('hashContrasena');
  });
});

const USER_ID = 'f0836911-5b63-490c-88a2-9176b9b2b4a1';
const REQUEST_IP = '192.0.2.10';

describe('UsuariosService read and update operations', () => {
  describe('listar', () => {
    it('returns public users and requests only active profiles', async () => {
      const account = {
        id: USER_ID,
        estado: EstadoUsuario.ACTIVO,
        hashContrasena: 'must-not-be-returned',
      };
      const data = {
        id: USER_ID,
        nombres: 'Ana',
        apellidos: 'Pérez',
        correo: 'ana@example.com',
        telefono: '3001234567',
        cuentaUsuario: account,
      };
      const profileRepository = {
        find: jest.fn().mockResolvedValue([{ rol: RolUsuario.DRIVER }]),
      };
      const manager = createManager(
        new Map<Function, object>([[Perfil, profileRepository]]),
      );
      const datosRepository = {
        find: jest.fn().mockResolvedValue([data]),
      };
      const cuentaRepository = { manager };
      const service = new UsuariosService(
        cuentaRepository as never,
        datosRepository as never,
        {} as never,
      );

      const users = await service.listar();

      expect(users).toEqual([
        {
          id: USER_ID,
          firstName: 'Ana',
          lastName: 'Pérez',
          email: 'ana@example.com',
          phone: '3001234567',
          status: EstadoUsuario.ACTIVO,
          roles: [RolUsuario.DRIVER],
        },
      ]);

      expect(datosRepository.find).toHaveBeenCalledWith({
        relations: { cuentaUsuario: true },
        order: { apellidos: 'ASC', nombres: 'ASC' },
      });
      expect(manager.getRepository).toHaveBeenCalledWith(Perfil);
      expect(profileRepository.find).toHaveBeenCalledWith({
        where: { cuentaUsuario: { id: USER_ID }, activo: true },
      });
      expect(users[0]).not.toHaveProperty('hashContrasena');
    });
  });

  describe('obtener', () => {
    it('returns the public user and looks up only active profiles', async () => {
      const data = {
        id: USER_ID,
        nombres: 'Ana',
        apellidos: 'Pérez',
        correo: 'ana@example.com',
        telefono: null,
        cuentaUsuario: {
          id: USER_ID,
          estado: EstadoUsuario.ACTIVO,
        },
      };
      const profileRepository = {
        find: jest
          .fn()
          .mockResolvedValue([{ rol: RolUsuario.OPERATIONS_MANAGER }]),
      };
      const manager = createManager(
        new Map<Function, object>([[Perfil, profileRepository]]),
      );
      const datosRepository = {
        findOne: jest.fn().mockResolvedValue(data),
      };
      const service = new UsuariosService(
        { manager } as never,
        datosRepository as never,
        {} as never,
      );

      await expect(service.obtener(USER_ID)).resolves.toEqual({
        id: USER_ID,
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: null,
        status: EstadoUsuario.ACTIVO,
        roles: [RolUsuario.OPERATIONS_MANAGER],
      });

      expect(datosRepository.findOne).toHaveBeenCalledWith({
        where: { id: USER_ID },
        relations: { cuentaUsuario: true },
      });
      expect(profileRepository.find).toHaveBeenCalledWith({
        where: { cuentaUsuario: { id: USER_ID }, activo: true },
      });
    });

    it.each([
      ['a missing user', null],
      ['a user without an account', { id: USER_ID, cuentaUsuario: null }],
    ])('throws NotFoundException for %s', async (_description, data) => {
      const datosRepository = {
        findOne: jest.fn().mockResolvedValue(data),
      };
      const service = new UsuariosService(
        {} as never,
        datosRepository as never,
        {} as never,
      );

      await expect(service.obtener(USER_ID)).rejects.toThrow(
        new NotFoundException('El usuario no existe.'),
      );
      expect(datosRepository.findOne).toHaveBeenCalledWith({
        where: { id: USER_ID },
        relations: { cuentaUsuario: true },
      });
    });
  });

  describe('obtenerPropio', () => {
    it('delegates to obtener with the authenticated user ID', async () => {
      const service = new UsuariosService(
        {} as never,
        {} as never,
        {} as never,
      );
      const user = {
        id: USER_ID,
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: null,
        status: EstadoUsuario.ACTIVO,
        roles: [RolUsuario.DRIVER],
      };
      const obtenerSpy = jest.spyOn(service, 'obtener').mockResolvedValue(user);

      await expect(service.obtenerPropio(USER_ID)).resolves.toEqual(user);

      expect(obtenerSpy).toHaveBeenCalledWith(USER_ID);
    });
  });

  describe('actualizarPropio', () => {
    it('updates supplied fields, preserves omitted fields, and returns active roles transactionally', async () => {
      const data = {
        id: USER_ID,
        nombres: 'Ana',
        apellidos: 'Pérez',
        correo: 'ana@example.com',
        telefono: '3001234567',
        cuentaUsuario: {
          id: USER_ID,
          estado: EstadoUsuario.ACTIVO,
        },
      };
      const datosRepository = {
        findOne: jest.fn().mockResolvedValue(data),
        save: jest.fn(async (value) => value),
      };
      const profileRepository = {
        find: jest.fn().mockResolvedValue([{ rol: RolUsuario.DRIVER }]),
      };
      const manager = createManager(
        new Map<Function, object>([
          [DatosUsuario, datosRepository],
          [Perfil, profileRepository],
        ]),
      );
      const auditContext = createAuditContext(manager);
      const service = new UsuariosService(
        {} as never,
        {} as never,
        auditContext as never,
      );

      await expect(
        service.actualizarPropio(
          USER_ID,
          { firstName: 'Ana María', phone: '3007654321' },
          USER_ID,
          REQUEST_IP,
        ),
      ).resolves.toEqual({
        id: USER_ID,
        firstName: 'Ana María',
        lastName: 'Pérez',
        email: 'ana@example.com',
        phone: '3007654321',
        status: EstadoUsuario.ACTIVO,
        roles: [RolUsuario.DRIVER],
      });

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        USER_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(manager.getRepository).toHaveBeenNthCalledWith(1, DatosUsuario);
      expect(manager.getRepository).toHaveBeenNthCalledWith(2, Perfil);
      expect(datosRepository.findOne).toHaveBeenCalledWith({
        where: { id: USER_ID },
        relations: { cuentaUsuario: true },
      });
      expect(datosRepository.save).toHaveBeenCalledWith(data);
      expect(profileRepository.find).toHaveBeenCalledWith({
        where: { cuentaUsuario: { id: USER_ID }, activo: true },
      });
    });

    it('throws NotFoundException when the user has no associated account', async () => {
      const datosRepository = {
        findOne: jest
          .fn()
          .mockResolvedValue({ id: USER_ID, cuentaUsuario: null }),
        save: jest.fn(),
      };
      const manager = createManager(
        new Map<Function, object>([[DatosUsuario, datosRepository]]),
      );
      const auditContext = createAuditContext(manager);
      const service = new UsuariosService(
        {} as never,
        {} as never,
        auditContext as never,
      );

      await expect(
        service.actualizarPropio(USER_ID, {}, USER_ID, REQUEST_IP),
      ).rejects.toThrow(new NotFoundException('El usuario no existe.'));

      expect(auditContext.ejecutar).toHaveBeenCalledWith(
        USER_ID,
        REQUEST_IP,
        expect.any(Function),
      );
      expect(datosRepository.save).not.toHaveBeenCalled();
    });
  });
});

describe('UsuariosService crear unique constraint handling', () => {
  it('translates PostgreSQL unique violation 23505 to ConflictException', async () => {
    const accountRepository = {
      create: jest.fn((value) => value),
      save: jest.fn().mockRejectedValue({ code: '23505' }),
    };
    const manager = createManager(
      new Map<Function, object>([[CuentaUsuario, accountRepository]]),
    );
    const auditContext = createAuditContext(manager);
    const service = new UsuariosService(
      {} as never,
      {} as never,
      auditContext as never,
    );

    await expect(
      service.crear(
        {
          firstName: 'Ana',
          lastName: 'Pérez',
          email: 'ana@example.com',
          documentType: TipoDocumento.CC,
          documentId: '1234567890',
          role: RolUsuario.DRIVER,
          password: 'a-secure-password',
        },
        USER_ID,
        REQUEST_IP,
      ),
    ).rejects.toThrow(
      new ConflictException(
        'El correo o documento ya está asociado a otro usuario.',
      ),
    );

    expect(auditContext.ejecutar).toHaveBeenCalledWith(
      USER_ID,
      REQUEST_IP,
      expect.any(Function),
    );
  });
});
