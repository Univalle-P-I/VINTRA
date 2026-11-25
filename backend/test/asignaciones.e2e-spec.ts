import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { diaIso } from './../src/asignaciones/asignaciones.utils';

/**
 * Prueba de integración de la API de asignaciones contra PostgreSQL real
 * (VIN-030 / #93). Usa el esquema de `database/migrations`, que requiere PostGIS.
 *
 * Solo corre con RUN_DB_E2E=true y una base con las migraciones aplicadas
 * (ver el README del módulo). En el CI actual (postgres:16 vacío) se omite.
 */
const describeConBd =
  process.env.RUN_DB_E2E === 'true' ? describe : describe.skip;

// Lunes 2027-03-01, de 06:00 a 10:00 hora local (UTC-5) = 11:00-15:00 UTC.
const FECHA = '2027-03-01';

interface Escenario {
  vehiculoA: string;
  vehiculoB: string;
  conductorA: string;
  conductorB: string;
  progA: string;
  progB: string;
}

describeConBd('Asignaciones (e2e, PostgreSQL)', () => {
  let app: INestApplication<App>;
  let db: DataSource;
  let token: string;
  const sufijo = randomUUID().replace(/-/g, '').slice(0, 8);
  let contador = 0;

  // Ids creados, para limpiar al final.
  const creados = {
    vehicleTypes: [] as string[],
    vehiculos: [] as string[],
    cuadrillas: [] as string[],
    conductores: [] as string[],
    macrorutas: [] as string[],
    horarios: [] as string[],
    usuarios: [] as string[],
  };

  async function insertar(sql: string, params: unknown[]): Promise<string> {
    const filas = (await db.query(sql, params)) as { id: string }[];
    return filas[0].id;
  }

  /** Crea recursos independientes: 2 vehículos, 2 conductores (cada uno en su cuadrilla) y 2 programaciones que se cruzan. */
  async function prepararEscenario(): Promise<Escenario> {
    const n = ++contador;
    const etiqueta = `${sufijo}${n}`;

    const tipo = await insertar(
      'INSERT INTO vehicle_type (code, name) VALUES ($1, $2) RETURNING id',
      [`E2E-${etiqueta}`, 'E2E'],
    );
    creados.vehicleTypes.push(tipo);

    const vehiculos: string[] = [];
    for (const letra of ['A', 'B']) {
      const placa = `${letra}${n % 10}${sufijo.slice(0, 4)}`.toUpperCase();
      const id = await insertar(
        `INSERT INTO vehicle (vehicle_type_id, vehicle_status, plate, capacity_kg, capacity_yd3)
         VALUES ($1, 'AVAILABLE', $2, 1000, 10) RETURNING id`,
        [tipo, placa],
      );
      vehiculos.push(id);
      creados.vehiculos.push(id);
    }

    const usuario = await insertar(
      `INSERT INTO user_account (user_status, document_type, document_id, pwd_hash, first_name, last_name)
       VALUES ('ACTIVE', 'CC', $1, 'x', 'E2E', 'Conductor') RETURNING id`,
      [`E2E${etiqueta}`],
    );
    creados.usuarios.push(usuario);

    const conductores: string[] = [];
    for (const letra of ['A', 'B']) {
      const cuadrilla = await insertar(
        'INSERT INTO crew (name) VALUES ($1) RETURNING id',
        [`E2E ${letra} ${etiqueta}`],
      );
      creados.cuadrillas.push(cuadrilla);
      const conductor = await insertar(
        'INSERT INTO driver (user_account_id, crew_id) VALUES ($1, $2) RETURNING id',
        [usuario, cuadrilla],
      );
      conductores.push(conductor);
      creados.conductores.push(conductor);
    }

    const macro = await insertar(
      `INSERT INTO macroroute (code, name, geom)
       VALUES ($1, 'E2E', ST_GeomFromText('MULTILINESTRING((-77.0 3.8, -77.01 3.81))', 4326)) RETURNING id`,
      [`E2E-M-${etiqueta}`],
    );
    creados.macrorutas.push(macro);

    const horario = await insertar(
      `INSERT INTO schedule (name, start_time, end_time) VALUES ('E2E', '06:00', '10:00') RETURNING id`,
      [],
    );
    creados.horarios.push(horario);

    const programaciones: string[] = [];
    for (const letra of ['A', 'B']) {
      const micro = await insertar(
        `INSERT INTO microroute (macroroute_id, code, name, geom)
         VALUES ($1, $2, 'E2E', ST_GeomFromText('MULTILINESTRING((-77.0 3.8, -77.01 3.81))', 4326)) RETURNING id`,
        [macro, `E2E-${letra}-${etiqueta}`],
      );
      programaciones.push(
        await insertar(
          `INSERT INTO microroute_schedule (microroute_id, schedule_id, day_of_week)
           VALUES ($1, $2, $3) RETURNING id`,
          [micro, horario, diaIso(FECHA)],
        ),
      );
    }

    return {
      vehiculoA: vehiculos[0],
      vehiculoB: vehiculos[1],
      conductorA: conductores[0],
      conductorB: conductores[1],
      progA: programaciones[0],
      progB: programaciones[1],
    };
  }

  function crear(cuerpo: object, conToken = true) {
    const peticion = request(app.getHttpServer()).post('/assignments');
    return (
      conToken ? peticion.set('Authorization', `Bearer ${token}`) : peticion
    ).send(cuerpo);
  }

  async function contarPorVehiculo(vehiculoId: string): Promise<number> {
    const filas = (await db.query(
      'SELECT count(*)::int AS total FROM assignment WHERE vehicle_id = $1',
      [vehiculoId],
    )) as { total: number }[];
    return filas[0].total;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    db = app.get(DataSource);
    token = app
      .get(JwtService, { strict: false })
      .sign({ sub: randomUUID(), roles: ['ADMIN'] });
  }, 30000);

  afterAll(async () => {
    if (db?.isInitialized) {
      // Las FK con ON DELETE CASCADE eliminan microrutas, programaciones y asignaciones.
      if (creados.vehiculos.length > 0) {
        await db.query('DELETE FROM assignment WHERE vehicle_id = ANY($1)', [
          creados.vehiculos,
        ]);
      }
      const tablas: [string, string[]][] = [
        ['driver', creados.conductores],
        ['crew', creados.cuadrillas],
        ['vehicle', creados.vehiculos],
        ['vehicle_type', creados.vehicleTypes],
        ['macroroute', creados.macrorutas],
        ['schedule', creados.horarios],
        ['user_account', creados.usuarios],
      ];
      for (const [tabla, ids] of tablas) {
        if (ids.length > 0) {
          await db.query(`DELETE FROM ${tabla} WHERE id = ANY($1)`, [ids]);
        }
      }
    }
    await app?.close();
  }, 30000);

  it('rechaza con 401 una solicitud sin token', async () => {
    await crear({}, false).expect(401);
  });

  it('persiste una asignación válida con el horario de la franja', async () => {
    const e = await prepararEscenario();

    const respuesta = await crear({
      programacionId: e.progA,
      conductorId: e.conductorA,
      vehiculoId: e.vehiculoA,
      fecha: FECHA,
    }).expect(201);

    expect(respuesta.body).toMatchObject({ estado: 'SCHEDULED', activo: true });
    const filas = (await db.query(
      `SELECT assignment_status::text AS estado,
              to_char(scheduled_start_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI') AS inicio
       FROM assignment WHERE vehicle_id = $1`,
      [e.vehiculoA],
    )) as { estado: string; inicio: string }[];
    expect(filas).toEqual([
      { estado: 'SCHEDULED', inicio: '2027-03-01T11:00' },
    ]);
  });

  it('rechaza con 409 y el motivo un vehículo en mantenimiento', async () => {
    const e = await prepararEscenario();
    await db.query(
      `UPDATE vehicle SET vehicle_status = 'MAINTENANCE' WHERE id = $1`,
      [e.vehiculoA],
    );

    const respuesta = await crear({
      programacionId: e.progA,
      conductorId: e.conductorA,
      vehiculoId: e.vehiculoA,
      fecha: FECHA,
    }).expect(409);

    expect(respuesta.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'vehiculoId' }),
      ]),
    );
    expect(await contarPorVehiculo(e.vehiculoA)).toBe(0);
  });

  it('dos solicitudes idénticas simultáneas: una se guarda y la otra recibe 409', async () => {
    const e = await prepararEscenario();
    const cuerpo = {
      programacionId: e.progA,
      conductorId: e.conductorA,
      vehiculoId: e.vehiculoA,
      fecha: FECHA,
    };

    const [r1, r2] = await Promise.all([crear(cuerpo), crear(cuerpo)]);

    expect([r1.status, r2.status].sort()).toEqual([201, 409]);
    expect(await contarPorVehiculo(e.vehiculoA)).toBe(1);
  });

  it('dos solicitudes simultáneas que se cruzan por el mismo vehículo: no hay doble reserva', async () => {
    // Programaciones distintas: la restricción única de la BD no lo detecta;
    // solo lo evitan los bloqueos y la validación de cruce del servicio.
    const e = await prepararEscenario();

    const [r1, r2] = await Promise.all([
      crear({
        programacionId: e.progA,
        conductorId: e.conductorA,
        vehiculoId: e.vehiculoA,
        fecha: FECHA,
      }),
      crear({
        programacionId: e.progB,
        conductorId: e.conductorB,
        vehiculoId: e.vehiculoA,
        fecha: FECHA,
      }),
    ]);

    expect([r1.status, r2.status].sort()).toEqual([201, 409]);
    expect(await contarPorVehiculo(e.vehiculoA)).toBe(1);
  });

  it('dos solicitudes simultáneas con el mismo conductor y distinto vehículo: no hay doble reserva', async () => {
    const e = await prepararEscenario();

    const [r1, r2] = await Promise.all([
      crear({
        programacionId: e.progA,
        conductorId: e.conductorA,
        vehiculoId: e.vehiculoA,
        fecha: FECHA,
      }),
      crear({
        programacionId: e.progB,
        conductorId: e.conductorA,
        vehiculoId: e.vehiculoB,
        fecha: FECHA,
      }),
    ]);

    expect([r1.status, r2.status].sort()).toEqual([201, 409]);
    const filas = (await db.query(
      'SELECT count(*)::int AS total FROM assignment WHERE driver_id = $1',
      [e.conductorA],
    )) as { total: number }[];
    expect(filas[0].total).toBe(1);
  });
});
