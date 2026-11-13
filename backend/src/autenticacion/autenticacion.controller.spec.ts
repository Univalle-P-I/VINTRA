import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';

import { CuentaUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { Sesion } from './entidades/sesion.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('AutenticacionController', () => {
  let app: INestApplication<App>;
  let autenticacionService: { login: jest.Mock };

  beforeAll(async () => {
    autenticacionService = {
      login: jest.fn().mockResolvedValue({
        accessToken: 'signed-access-token',
        tokenType: 'Bearer',
        expiresIn: 900,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutenticacionController],
      providers: [
        { provide: AutenticacionService, useValue: autenticacionService },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: JwtService, useValue: {} },
        { provide: getRepositoryToken(Sesion), useValue: {} },
        { provide: getRepositoryToken(CuentaUsuario), useValue: {} },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    autenticacionService.login.mockClear();
  });

  it('exposes POST /api/v1/auth/login and transforms the email', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ' PERSONA@EXAMPLE.COM ', password: 'a-password' })
      .expect(200)
      .expect({
        accessToken: 'signed-access-token',
        tokenType: 'Bearer',
        expiresIn: 900,
      });

    expect(autenticacionService.login).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'persona@example.com' }),
      expect.any(String),
    );
  });

  it('rejects invalid login bodies before calling the service', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '' })
      .expect(400);

    expect(autenticacionService.login).not.toHaveBeenCalled();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
