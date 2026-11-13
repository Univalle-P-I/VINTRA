import { randomBytes, randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { DatosUsuario } from './../src/usuarios/entidades/datos-usuario.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let appInitialized = false;
  const mockedDatabaseTime = new Date('2026-01-01T00:00:00.000Z');
  const loginQueryBuilder = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };
  const datosUsuarioRepositoryMock = {
    createQueryBuilder: jest.fn(() => loginQueryBuilder),
  };
  const fallbackRepository = {};
  const databaseQuery = jest
    .fn()
    .mockResolvedValue([{ current_time: mockedDatabaseTime }]);
  const dataSourceMock = {
    query: databaseQuery,
    getRepository: jest.fn(() => fallbackRepository),
    entityMetadatas: [],
    manager: { getRepository: jest.fn(() => fallbackRepository) },
    options: { type: 'postgres' },
    isInitialized: false,
  };
  const originalEnvironment = {
    JWT_SECRET: process.env.JWT_SECRET,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
  };

  beforeAll(() => {
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = '1';
    process.env.POSTGRES_USER = 'vintra_e2e';
    process.env.POSTGRES_PASSWORD = 'e2e-only-not-a-real-password';
    process.env.POSTGRES_DB = 'vintra_e2e';
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    databaseQuery.mockResolvedValue([{ current_time: mockedDatabaseTime }]);
    loginQueryBuilder.getMany.mockResolvedValue([]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(dataSourceMock)
      .overrideProvider(getRepositoryToken(DatosUsuario))
      .useValue(datosUsuarioRepositoryMock)
      .compile();

    const nestApp = moduleFixture.createNestApplication();
    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await nestApp.init();
    app = nestApp;
    appInitialized = true;
  });

  it('/ (GET)', () => {
    return request(getInitializedApp().getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET) reports the backend as available', async () => {
    const response = await request(getInitializedApp().getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'vintra-backend',
    });
  });

  it('/health/db (GET) reports a successful simulated PostgreSQL query', async () => {
    const response = await request(getInitializedApp().getHttpServer())
      .get('/health/db')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
    expect(response.body.time).toBe(mockedDatabaseTime.toISOString());
    expect(databaseQuery).toHaveBeenCalledWith(
      'SELECT NOW() AS current_time',
    );
  });

  it('/health/db (GET) reports when the simulated PostgreSQL query fails', async () => {
    databaseQuery.mockRejectedValueOnce(new Error('Simulated database failure'));

    const response = await request(getInitializedApp().getHttpServer())
      .get('/health/db')
      .expect(503);

    expect(response.body).toEqual({
      status: 'error',
      database: 'disconnected',
    });
  });

  it('/api/v1/auth/login (POST) validates the request DTO', () => {
    return request(getInitializedApp().getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '' })
      .expect(400);
  });

  it('/api/v1/auth/login (POST) rejects unknown users from the repository mock', async () => {
    const email = `missing-${randomUUID()}@example.invalid`;
    const response = await request(getInitializedApp().getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'valid-format-password',
      })
      .expect(401);

    expect(response.body.message).toBe('Credenciales no válidas.');
    expect(datosUsuarioRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
      'userData',
    );
    expect(loginQueryBuilder.where).toHaveBeenCalledWith(
      'LOWER(BTRIM(userData.correo)) = :email',
      { email },
    );
    expect(loginQueryBuilder.getMany).toHaveBeenCalled();
  });

  afterEach(async () => {
    if (!appInitialized || !app) {
      return;
    }

    try {
      await app.close();
    } finally {
      appInitialized = false;
      app = undefined;
    }
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  function getInitializedApp(): INestApplication<App> {
    if (!appInitialized || !app) {
      throw new Error('The E2E application has not been initialized.');
    }
    return app;
  }
});
