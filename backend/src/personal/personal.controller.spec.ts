import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InMemoryRepository } from '../testing/in-memory.repository';
import { callApi } from '../testing/http-client';
import { CrewMember } from './entities/crew-member.entity';
import { Driver } from './entities/driver.entity';
import { PersonalController } from './personal.controller';
import { PersonalService } from './personal.service';

const USER_ID = '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f';
const CREW_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
const MISSING_ID = '11111111-2222-4333-8444-555555555555';

type DriverBody = {
  id: string;
  userAccountId: string;
  crewId: string | null;
  isActive: boolean;
  startedAt: string;
  endedAt: string | null;
};
type MemberBody = {
  id: string;
  fullName: string;
  crewId: string | null;
  isActive: boolean;
};
type ErrorBody = { statusCode: number; message: string | string[] };

describe('PersonalController (HTTP)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let drivers: InMemoryRepository<Driver>;
  let members: InMemoryRepository<CrewMember>;

  beforeEach(async () => {
    drivers = new InMemoryRepository<Driver>();
    members = new InMemoryRepository<CrewMember>();
    const moduleRef = await Test.createTestingModule({
      controllers: [PersonalController],
      providers: [
        PersonalService,
        { provide: getRepositoryToken(Driver), useValue: drivers },
        { provide: getRepositoryToken(CrewMember), useValue: members },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('conductores', () => {
    it('crea un conductor activo y sin cuadrilla', async () => {
      const res = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        userAccountId: USER_ID,
        crewId: null,
        isActive: true,
      });
      expect(res.body.id).toEqual(expect.any(String));
    });

    it('rechaza una cuenta de usuario que no es UUID', async () => {
      const res = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: 'abc',
      });

      expect(res.status).toBe(400);
    });

    it('rechaza propiedades desconocidas', async () => {
      const res = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        isAdmin: true,
      });

      expect(res.status).toBe(400);
      expect(drivers.rows).toHaveLength(0);
    });

    it('lista solo los activos por defecto y permite pedir los inactivos', async () => {
      const first = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
      });
      await callApi(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: MISSING_ID,
      });
      await callApi(baseUrl, 'DELETE', `/personal/drivers/${first.body.id}`);

      const active = await callApi<DriverBody[]>(baseUrl, 'GET', '/personal/drivers');
      const inactive = await callApi<DriverBody[]>(
        baseUrl,
        'GET',
        '/personal/drivers?isActive=false',
      );

      expect(active.body.map((d) => d.userAccountId)).toEqual([MISSING_ID]);
      expect(inactive.body.map((d) => d.id)).toEqual([first.body.id]);
    });

    it('filtra por cuadrilla y rechaza filtros inválidos', async () => {
      await callApi(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        crewId: CREW_ID,
      });
      await callApi(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: MISSING_ID,
      });

      const byCrew = await callApi<DriverBody[]>(
        baseUrl,
        'GET',
        `/personal/drivers?crewId=${CREW_ID}`,
      );
      const badFlag = await callApi<ErrorBody>(
        baseUrl,
        'GET',
        '/personal/drivers?isActive=quizas',
      );
      const unknown = await callApi<ErrorBody>(
        baseUrl,
        'GET',
        '/personal/drivers?page=2',
      );

      expect(byCrew.body).toHaveLength(1);
      expect(badFlag.status).toBe(400);
      expect(unknown.status).toBe(400);
    });

    it('responde 400 con un id mal formado y 404 con uno inexistente', async () => {
      const malformed = await callApi<ErrorBody>(baseUrl, 'GET', '/personal/drivers/123');
      const missing = await callApi<ErrorBody>(
        baseUrl,
        'GET',
        `/personal/drivers/${MISSING_ID}`,
      );

      expect(malformed.status).toBe(400);
      expect(missing.status).toBe(404);
    });

    it('actualiza la cuadrilla y permite quitarla con null', async () => {
      const created = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
      });
      const path = `/personal/drivers/${created.body.id}`;

      const assigned = await callApi<DriverBody>(baseUrl, 'PATCH', path, {
        crewId: CREW_ID,
      });
      const cleared = await callApi<DriverBody>(baseUrl, 'PATCH', path, {
        crewId: null,
      });

      expect(assigned.body.crewId).toBe(CREW_ID);
      expect(cleared.status).toBe(200);
      expect(cleared.body.crewId).toBeNull();
    });

    it('rechaza una fecha de fin anterior a la de inicio', async () => {
      const created = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        startedAt: '2026-11-19T08:00:00Z',
      });

      const res = await callApi<ErrorBody>(
        baseUrl,
        'PATCH',
        `/personal/drivers/${created.body.id}`,
        { endedAt: '2026-11-18T08:00:00Z' },
      );

      expect(res.status).toBe(400);
      expect(drivers.rows[0].endedAt ?? null).toBeNull();
    });

    it('acepta una fecha de fin posterior', async () => {
      const created = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        startedAt: '2026-11-19T08:00:00Z',
      });

      const res = await callApi<DriverBody>(
        baseUrl,
        'PATCH',
        `/personal/drivers/${created.body.id}`,
        { endedAt: '2026-11-20T08:00:00Z' },
      );

      expect(res.status).toBe(200);
      expect(res.body.endedAt).toBe('2026-11-20T08:00:00.000Z');
    });

    it('da de baja con DELETE y restaura con PATCH', async () => {
      const created = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
      });
      const path = `/personal/drivers/${created.body.id}`;

      const removed = await callApi<DriverBody>(baseUrl, 'DELETE', path);
      const restored = await callApi<DriverBody>(baseUrl, 'PATCH', path, {
        isActive: true,
      });

      expect(removed.status).toBe(200);
      expect(removed.body.isActive).toBe(false);
      expect(drivers.rows).toHaveLength(1);
      expect(restored.body.isActive).toBe(true);
    });

    it('traduce una clave foránea inexistente a un 400', async () => {
      drivers.failWith = {
        driverError: { code: '23503', constraint: 'fk_driver_crew' },
      };

      const res = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        crewId: CREW_ID,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('La cuadrilla indicada no existe.');
    });

    it('no oculta los errores inesperados de la base de datos', async () => {
      drivers.failWith = new Error('conexión perdida');

      const res = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
      });

      expect(res.status).toBe(500);
    });
  });

  describe('miembros de cuadrilla', () => {
    it('crea un miembro y recorta los espacios del nombre', async () => {
      const res = await callApi<MemberBody>(baseUrl, 'POST', '/personal/crew-members', {
        fullName: '  Ana Pérez  ',
        crewId: CREW_ID,
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        fullName: 'Ana Pérez',
        crewId: CREW_ID,
        isActive: true,
      });
    });

    it('rechaza nombres vacíos o de más de 120 caracteres', async () => {
      const empty = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/crew-members', {
        fullName: '   ',
      });
      const long = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/crew-members', {
        fullName: 'a'.repeat(121),
      });

      expect(empty.status).toBe(400);
      expect(long.status).toBe(400);
      expect(members.rows).toHaveLength(0);
    });

    it('lista, consulta, actualiza, da de baja y restaura', async () => {
      const created = await callApi<MemberBody>(
        baseUrl,
        'POST',
        '/personal/crew-members',
        { fullName: 'Luis Mora' },
      );
      const path = `/personal/crew-members/${created.body.id}`;

      const listed = await callApi<MemberBody[]>(baseUrl, 'GET', '/personal/crew-members');
      const fetched = await callApi<MemberBody>(baseUrl, 'GET', path);
      const renamed = await callApi<MemberBody>(baseUrl, 'PATCH', path, {
        fullName: 'Luis A. Mora',
      });
      const removed = await callApi<MemberBody>(baseUrl, 'DELETE', path);
      const listedAfter = await callApi<MemberBody[]>(
        baseUrl,
        'GET',
        '/personal/crew-members',
      );
      const restored = await callApi<MemberBody>(baseUrl, 'PATCH', path, {
        isActive: true,
      });

      expect(listed.body).toHaveLength(1);
      expect(fetched.body.fullName).toBe('Luis Mora');
      expect(renamed.body.fullName).toBe('Luis A. Mora');
      expect(removed.body.isActive).toBe(false);
      expect(listedAfter.body).toHaveLength(0);
      expect(restored.body.isActive).toBe(true);
    });

    it('responde 404 al actualizar un miembro inexistente', async () => {
      const res = await callApi<ErrorBody>(
        baseUrl,
        'PATCH',
        `/personal/crew-members/${MISSING_ID}`,
        { fullName: 'Nadie' },
      );

      expect(res.status).toBe(404);
    });
  });

  describe('valores null y formato de fechas', () => {
    const INVALID_DATES: Array<[string, unknown]> = [
      ['una fecha por semana', '2026-W47-5'],
      ['solo la fecha', '2026-11-19'],
      ['una hora sin zona horaria', '2026-11-19T08:00:00'],
      ['el 30 de febrero', '2026-02-30T08:00:00Z'],
      ['la hora 24', '2026-11-19T24:00:00Z'],
      ['un número', 1763539200],
    ];

    async function createDriver(): Promise<DriverBody> {
      const res = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        startedAt: '2026-11-19T08:00:00Z',
      });
      return res.body;
    }

    it('rechaza null en startedAt e isActive sin modificar el conductor', async () => {
      const driver = await createDriver();
      const path = `/personal/drivers/${driver.id}`;

      const startedAtNull = await callApi<ErrorBody>(baseUrl, 'PATCH', path, {
        startedAt: null,
      });
      const isActiveNull = await callApi<ErrorBody>(baseUrl, 'PATCH', path, {
        isActive: null,
      });
      const after = await callApi<DriverBody>(baseUrl, 'GET', path);

      expect([startedAtNull.status, isActiveNull.status]).toEqual([400, 400]);
      expect(after.body.startedAt).toBe('2026-11-19T08:00:00.000Z');
      expect(after.body.isActive).toBe(true);
    });

    it('rechaza null en startedAt al registrar un conductor', async () => {
      const res = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        startedAt: null,
      });

      expect(res.status).toBe(400);
      expect(drivers.rows).toHaveLength(0);
    });

    it('permite limpiar crewId y endedAt con null', async () => {
      const driver = await createDriver();
      const path = `/personal/drivers/${driver.id}`;
      await callApi(baseUrl, 'PATCH', path, {
        crewId: CREW_ID,
        endedAt: '2026-11-20T08:00:00Z',
      });

      const cleared = await callApi<DriverBody>(baseUrl, 'PATCH', path, {
        crewId: null,
        endedAt: null,
      });

      expect(cleared.status).toBe(200);
      expect(cleared.body.crewId).toBeNull();
      expect(cleared.body.endedAt).toBeNull();
    });

    it.each(INVALID_DATES)(
      'rechaza %s al registrar y al actualizar sin guardar nada',
      async (_description, value) => {
        const created = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/drivers', {
          userAccountId: USER_ID,
          startedAt: value,
        });
        expect(created.status).toBe(400);
        expect(drivers.rows).toHaveLength(0);

        const driver = await createDriver();
        const path = `/personal/drivers/${driver.id}`;
        const startedAt = await callApi<ErrorBody>(baseUrl, 'PATCH', path, {
          startedAt: value,
        });
        const endedAt = await callApi<ErrorBody>(baseUrl, 'PATCH', path, {
          endedAt: value,
        });
        const after = await callApi<DriverBody>(baseUrl, 'GET', path);

        expect([startedAt.status, endedAt.status]).toEqual([400, 400]);
        expect(after.body.startedAt).toBe('2026-11-19T08:00:00.000Z');
        expect(after.body.endedAt ?? null).toBeNull();
      },
    );

    it('convierte a UTC una fecha con desfase horario', async () => {
      const res = await callApi<DriverBody>(baseUrl, 'POST', '/personal/drivers', {
        userAccountId: USER_ID,
        startedAt: '2026-11-19T03:00:00-05:00',
      });

      expect(res.status).toBe(201);
      expect(res.body.startedAt).toBe('2026-11-19T08:00:00.000Z');
    });

    it('rechaza null en fullName e isActive de un miembro sin modificarlo', async () => {
      const created = await callApi<MemberBody>(baseUrl, 'POST', '/personal/crew-members', {
        fullName: 'Ana Pérez',
      });
      const path = `/personal/crew-members/${created.body.id}`;

      const onCreate = await callApi<ErrorBody>(baseUrl, 'POST', '/personal/crew-members', {
        fullName: null,
      });
      const fullNameNull = await callApi<ErrorBody>(baseUrl, 'PATCH', path, {
        fullName: null,
      });
      const isActiveNull = await callApi<ErrorBody>(baseUrl, 'PATCH', path, {
        isActive: null,
      });
      const after = await callApi<MemberBody>(baseUrl, 'GET', path);

      expect([onCreate.status, fullNameNull.status, isActiveNull.status]).toEqual([
        400, 400, 400,
      ]);
      expect(members.rows).toHaveLength(1);
      expect(after.body).toMatchObject({ fullName: 'Ana Pérez', isActive: true });
    });

    it('permite sacar a un miembro de su cuadrilla con crewId null', async () => {
      const created = await callApi<MemberBody>(baseUrl, 'POST', '/personal/crew-members', {
        fullName: 'Luis Mora',
        crewId: CREW_ID,
      });

      const res = await callApi<MemberBody>(
        baseUrl,
        'PATCH',
        `/personal/crew-members/${created.body.id}`,
        { crewId: null },
      );

      expect(res.status).toBe(200);
      expect(res.body.crewId).toBeNull();
    });
  });
});
