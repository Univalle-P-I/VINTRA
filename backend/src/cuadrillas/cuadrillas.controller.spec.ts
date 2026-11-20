import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PersonalService } from '../personal/personal.service';
import { callApi } from '../testing/http-client';
import { InMemoryRepository } from '../testing/in-memory.repository';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasService } from './cuadrillas.service';
import { Crew } from './entities/crew.entity';

const MISSING_ID = '11111111-2222-4333-8444-555555555555';

type CrewBody = { id: string; name: string; isActive: boolean };
type ErrorBody = { statusCode: number; message: string | string[] };

describe('CuadrillasController (HTTP)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let crews: InMemoryRepository<Crew>;

  beforeEach(async () => {
    crews = new InMemoryRepository<Crew>();
    const moduleRef = await Test.createTestingModule({
      controllers: [CuadrillasController],
      providers: [
        CuadrillasService,
        { provide: PersonalService, useValue: {} },
        { provide: getRepositoryToken(Crew), useValue: crews },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('crea una cuadrilla activa y recorta los espacios del nombre', async () => {
    const res = await callApi<CrewBody>(baseUrl, 'POST', '/cuadrillas', {
      name: '  Cuadrilla Norte ',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Cuadrilla Norte', isActive: true });
  });

  it('rechaza nombres vacíos, largos o propiedades desconocidas', async () => {
    const empty = await callApi<ErrorBody>(baseUrl, 'POST', '/cuadrillas', {
      name: '',
    });
    const long = await callApi<ErrorBody>(baseUrl, 'POST', '/cuadrillas', {
      name: 'a'.repeat(101),
    });
    const extra = await callApi<ErrorBody>(baseUrl, 'POST', '/cuadrillas', {
      name: 'Sur',
      color: 'rojo',
    });

    expect([empty.status, long.status, extra.status]).toEqual([400, 400, 400]);
    expect(crews.rows).toHaveLength(0);
  });

  it('lista solo las activas por defecto y permite pedir las inactivas', async () => {
    const north = await callApi<CrewBody>(baseUrl, 'POST', '/cuadrillas', {
      name: 'Norte',
    });
    await callApi(baseUrl, 'POST', '/cuadrillas', { name: 'Sur' });
    await callApi(baseUrl, 'DELETE', `/cuadrillas/${north.body.id}`);

    const active = await callApi<CrewBody[]>(baseUrl, 'GET', '/cuadrillas');
    const inactive = await callApi<CrewBody[]>(
      baseUrl,
      'GET',
      '/cuadrillas?isActive=false',
    );
    const invalid = await callApi<ErrorBody>(
      baseUrl,
      'GET',
      '/cuadrillas?isActive=quizas',
    );

    expect(active.body.map((crew) => crew.name)).toEqual(['Sur']);
    expect(inactive.body.map((crew) => crew.name)).toEqual(['Norte']);
    expect(invalid.status).toBe(400);
  });

  it('consulta, actualiza, da de baja y restaura una cuadrilla', async () => {
    const created = await callApi<CrewBody>(baseUrl, 'POST', '/cuadrillas', {
      name: 'Centro',
    });
    const path = `/cuadrillas/${created.body.id}`;

    const fetched = await callApi<CrewBody>(baseUrl, 'GET', path);
    const renamed = await callApi<CrewBody>(baseUrl, 'PATCH', path, {
      name: 'Centro 2',
    });
    const removed = await callApi<CrewBody>(baseUrl, 'DELETE', path);
    const restored = await callApi<CrewBody>(baseUrl, 'PATCH', path, {
      isActive: true,
    });

    expect(fetched.body.name).toBe('Centro');
    expect(renamed.body.name).toBe('Centro 2');
    expect(removed.status).toBe(200);
    expect(removed.body.isActive).toBe(false);
    expect(crews.rows).toHaveLength(1);
    expect(restored.body.isActive).toBe(true);
  });

  it('responde 400 con un id mal formado y 404 con uno inexistente', async () => {
    const malformed = await callApi<ErrorBody>(baseUrl, 'GET', '/cuadrillas/123');
    const missing = await callApi<ErrorBody>(
      baseUrl,
      'PATCH',
      `/cuadrillas/${MISSING_ID}`,
      { name: 'Nadie' },
    );

    expect(malformed.status).toBe(400);
    expect(missing.status).toBe(404);
  });
});
