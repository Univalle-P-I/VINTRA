import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import type { EntityManager } from 'typeorm';

import { ContextoAuditoriaService } from '../comun/contexto-auditoria.service';
import {
  CuentaUsuario,
  EstadoUsuario,
} from '../usuarios/entidades/cuenta-usuario.entity';
import { DatosUsuario } from '../usuarios/entidades/datos-usuario.entity';
import { AutenticacionService } from './autenticacion.service';

describe('AutenticacionService', () => {
  let service: AutenticacionService;
  let account: CuentaUsuario;
  let userData: DatosUsuario;
  let passwordHash: string;
  let queryBuilder: {
    innerJoinAndSelect: jest.Mock;
    where: jest.Mock;
    take: jest.Mock;
    getMany: jest.Mock;
  };
  let accountRepository: { update: jest.Mock };
  let sessionRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };
  let auditContext: { ejecutar: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeAll(async () => {
    passwordHash = await argon2.hash('correct-password', {
      type: argon2.argon2id,
      memoryCost: 1024,
      timeCost: 1,
      parallelism: 1,
    });
  });

  beforeEach(async () => {
    account = Object.assign(new CuentaUsuario(), {
      id: '98bfa4fd-360c-42d7-a027-c47e8fdb2e9b',
      estado: EstadoUsuario.ACTIVO,
      hashContrasena: passwordHash,
      bloqueadoHasta: null,
    });
    userData = Object.assign(new DatosUsuario(), {
      correo: 'persona@example.com',
      cuentaUsuario: account,
    });

    queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([userData]),
    };
    accountRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    sessionRepository = {
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const manager = {
      getRepository: (entity: Function) =>
        entity === CuentaUsuario ? accountRepository : sessionRepository,
    };
    auditContext = {
      ejecutar: jest.fn(
        async (
          _actorId: string,
          _requestIp: string,
          operation: (manager: EntityManager) => Promise<unknown>,
        ) => operation(manager as unknown as EntityManager),
      ),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacionService,
        {
          provide: getRepositoryToken(DatosUsuario),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
        {
          provide: ContextoAuditoriaService,
          useValue: auditContext,
        },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: (_key: string, defaultValue: string) => defaultValue,
          },
        },
      ],
    }).compile();

    service = module.get(AutenticacionService);
  });

  it('authenticates an active account and returns a short-lived access token', async () => {
    await expect(
      service.login({
        email: 'persona@example.com',
        password: 'correct-password',
      }, '127.0.0.1'),
    ).resolves.toEqual({
      accessToken: 'signed-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'LOWER(BTRIM(userData.correo)) = :email',
      { email: 'persona@example.com' },
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: account.id });
    expect(accountRepository.update).toHaveBeenCalledWith(
      account.id,
      expect.objectContaining({ ultimoInicioSesion: expect.any(Date) }),
    );
    expect(sessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        cuentaUsuario: account,
        hashToken: expect.any(String),
        ipSolicitud: '127.0.0.1',
        expiraEn: expect.any(Date),
      }),
    );
    expect(auditContext.ejecutar).toHaveBeenCalledWith(
      account.id,
      '127.0.0.1',
      expect.any(Function),
    );
  });

  it('rejects invalid credentials without updating the account', async () => {
    await expect(
      service.login({
        email: 'persona@example.com',
        password: 'wrong-password',
      }, '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(accountRepository.update).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('rejects inactive or currently locked accounts', async () => {
    account.estado = EstadoUsuario.INACTIVO;
    await expect(
      service.login({
        email: 'persona@example.com',
        password: 'correct-password',
      }, '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    account.estado = EstadoUsuario.ACTIVO;
    account.bloqueadoHasta = new Date(Date.now() + 60_000);
    await expect(
      service.login({
        email: 'persona@example.com',
        password: 'correct-password',
      }, '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects ambiguous normalized email matches', async () => {
    queryBuilder.getMany.mockResolvedValue([userData, userData]);

    await expect(
      service.login({
        email: 'persona@example.com',
        password: 'correct-password',
      }, '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
