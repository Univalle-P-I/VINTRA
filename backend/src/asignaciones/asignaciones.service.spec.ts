import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, FindOperator, Repository } from 'typeorm';
import { Crew } from '../cuadrillas/entities/crew.entity';
import { Driver } from '../personal/entities/driver.entity';
import { Microruta } from '../rutas/microrutas/entities/microruta.entity';
import { EstadoAsignacion, EstadoVehiculo } from './asignaciones.constants';
import { AsignacionesService } from './asignaciones.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';
import { Asignacion } from './entities/asignacion.entity';
import { Horario } from './entities/horario.entity';
import { ProgramacionMicroruta } from './entities/programacion-microruta.entity';
import { Vehiculo } from './entities/vehiculo.entity';

// 2026-12-15 es martes (día ISO 2). Horario 06:00-10:00 local = 11:00-15:00 UTC.
const dto: CrearAsignacionDto = {
  programacionId: 'prog-1',
  conductorId: 'drv-1',
  vehiculoId: 'veh-1',
  fecha: '2026-12-15',
};

type Fila = Record<string, unknown>;

interface Datos {
  programacion: Fila | null;
  microruta: Fila | null;
  horario: Fila | null;
  conductor: Fila | null;
  cuadrilla: Fila | null;
  vehiculo: Fila | null;
  guardadas: Fila[];
}

function datosValidos(): Datos {
  return {
    programacion: {
      id: 'prog-1',
      microrutaId: 'micro-1',
      horarioId: 'hor-1',
      diaSemana: 2,
      activo: true,
    },
    microruta: { id: 'micro-1', activo: true },
    horario: {
      id: 'hor-1',
      horaInicio: '06:00:00',
      horaFin: '10:00:00',
      activo: true,
    },
    conductor: { id: 'drv-1', crewId: 'crew-1', isActive: true, endedAt: null },
    cuadrilla: { id: 'crew-1', isActive: true },
    vehiculo: { id: 'veh-1', activo: true, estado: EstadoVehiculo.AVAILABLE },
    guardadas: [],
  };
}

/** Manager en memoria: registra el orden de bloqueos y simula las consultas. */
function crearManager(datos: Datos) {
  const bloqueos: string[] = [];
  const manager = {
    findOne: jest.fn(
      (entidad: unknown, opciones: { lock?: { mode: string } }) => {
        if (opciones.lock) {
          bloqueos.push(
            `${(entidad as { name: string }).name}:${opciones.lock.mode}`,
          );
        }
        const mapa = new Map<unknown, unknown>([
          [ProgramacionMicroruta, datos.programacion],
          [Microruta, datos.microruta],
          [Horario, datos.horario],
          [Driver, datos.conductor],
          [Crew, datos.cuadrilla],
          [Vehiculo, datos.vehiculo],
        ]);
        return Promise.resolve(mapa.get(entidad) ?? null);
      },
    ),
    // Devuelve las asignaciones que se solapan con la ventana pedida.
    find: jest.fn((_entidad: unknown, opciones: { where: Fila[] }) => {
      const primera = opciones.where[0];
      const finNuevo = (primera.inicioProgramado as FindOperator<Date>).value;
      const inicioNuevo = (primera.finProgramado as FindOperator<Date>).value;
      return Promise.resolve(
        datos.guardadas.filter(
          (g) =>
            (g.inicioProgramado as Date) < finNuevo &&
            (g.finProgramado as Date) > inicioNuevo,
        ),
      );
    }),
    create: jest.fn((_entidad: unknown, valores: Fila) => ({ ...valores })),
    save: jest.fn((entidad: Fila) => {
      const guardada = {
        id: `asig-${datos.guardadas.length + 1}`,
        ...entidad,
        programacion: { microrutaId: 'micro-1' },
        conductor: { crewId: 'crew-1' },
      };
      datos.guardadas.push(guardada);
      return Promise.resolve(guardada);
    }),
  };
  return { manager, bloqueos };
}

function crearServicio(datos: Datos, serializar = false) {
  const { manager, bloqueos } = crearManager(datos);
  let cola: Promise<unknown> = Promise.resolve();
  const dataSource = {
    // Con `serializar` imita FOR UPDATE: una transacción espera a la otra.
    transaction: jest.fn((callback: (m: EntityManager) => Promise<unknown>) => {
      const ejecutar = () => callback(manager as unknown as EntityManager);
      if (!serializar) {
        return ejecutar();
      }
      const turno = cola.then(ejecutar, ejecutar);
      cola = turno.catch(() => undefined);
      return turno;
    }),
  };
  const repositorio = { find: jest.fn(), findOne: jest.fn() };
  const servicio = new AsignacionesService(
    dataSource as unknown as DataSource,
    repositorio as unknown as Repository<Asignacion>,
  );
  return { servicio, manager, bloqueos, repositorio };
}

async function detalles(promesa: Promise<unknown>) {
  const error = (await promesa.catch((e: unknown) => e)) as ConflictException;
  return {
    error,
    details: (error.getResponse() as { details: Fila[] }).details,
  };
}

describe('AsignacionesService.crear', () => {
  it('persiste una asignación válida y bloquea los recursos en orden fijo', async () => {
    const datos = datosValidos();
    const { servicio, bloqueos } = crearServicio(datos);

    const resultado = await servicio.crear(dto);

    expect(resultado).toMatchObject({
      conductorId: 'drv-1',
      programacionId: 'prog-1',
      vehiculoId: 'veh-1',
      estado: EstadoAsignacion.SCHEDULED,
      activo: true,
    });
    expect((resultado.inicioProgramado as Date).toISOString()).toBe(
      '2026-12-15T11:00:00.000Z',
    );
    expect((resultado.finProgramado as Date).toISOString()).toBe(
      '2026-12-15T15:00:00.000Z',
    );
    expect(datos.guardadas).toHaveLength(1);
    expect(bloqueos).toEqual([
      'ProgramacionMicroruta:pessimistic_write',
      'Microruta:pessimistic_write',
      'Driver:pessimistic_write',
      'Crew:pessimistic_write',
      'Vehiculo:pessimistic_write',
    ]);
  });

  it.each([
    ['programacion', 'Programación de microruta no encontrada.'],
    ['conductor', 'Conductor no encontrado.'],
    ['vehiculo', 'Vehículo no encontrado.'],
  ] as const)('responde 404 si no existe %s', async (campo, mensaje) => {
    const datos = datosValidos();
    datos[campo] = null;
    const { servicio } = crearServicio(datos);

    await expect(servicio.crear(dto)).rejects.toThrow(
      new NotFoundException(mensaje),
    );
    expect(datos.guardadas).toHaveLength(0);
  });

  it('responde 400 si la fecha no cae en el día de la programación', async () => {
    const datos = datosValidos();
    const { servicio } = crearServicio(datos);

    await expect(
      servicio.crear(Object.assign({}, dto, { fecha: '2026-12-16' })),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(datos.guardadas).toHaveLength(0);
  });

  it('rechaza un vehículo inhabilitado explicando el motivo', async () => {
    const datos = datosValidos();
    datos.vehiculo = { ...datos.vehiculo, activo: false };
    const { servicio } = crearServicio(datos);

    const { error, details } = await detalles(servicio.crear(dto));

    expect(error).toBeInstanceOf(ConflictException);
    expect(details).toEqual([
      { field: 'vehiculoId', reason: 'El vehículo está inhabilitado.' },
    ]);
    expect(datos.guardadas).toHaveLength(0);
  });

  it.each([EstadoVehiculo.MAINTENANCE, EstadoVehiculo.OUT_OF_SERVICE])(
    'rechaza un vehículo en estado %s',
    async (estado) => {
      const datos = datosValidos();
      datos.vehiculo = { ...datos.vehiculo, estado };
      const { servicio } = crearServicio(datos);

      const { details } = await detalles(servicio.crear(dto));

      expect(details[0]).toMatchObject({ field: 'vehiculoId' });
      expect(datos.guardadas).toHaveLength(0);
    },
  );

  it('permite un vehículo IN_USE: el cruce de horarios lo controla el chequeo temporal', async () => {
    const datos = datosValidos();
    datos.vehiculo = { ...datos.vehiculo, estado: EstadoVehiculo.IN_USE };
    const { servicio } = crearServicio(datos);

    await expect(servicio.crear(dto)).resolves.toBeDefined();
  });

  it('rechaza conductor inhabilitado o desvinculado y cuadrilla inactiva', async () => {
    const datos = datosValidos();
    datos.conductor = { ...datos.conductor, isActive: false };
    datos.cuadrilla = { id: 'crew-1', isActive: false };
    const { servicio } = crearServicio(datos);

    const { details } = await detalles(servicio.crear(dto));

    expect(details).toEqual([
      expect.objectContaining({ field: 'conductorId' }),
      expect.objectContaining({ field: 'conductorId' }),
    ]);
  });

  it('rechaza microruta o programación inactivas', async () => {
    const datos = datosValidos();
    datos.microruta = { id: 'micro-1', activo: false };
    const { servicio } = crearServicio(datos);

    const { details } = await detalles(servicio.crear(dto));

    expect(details[0]).toMatchObject({ field: 'programacionId' });
  });

  it('acepta un conductor sin cuadrilla', async () => {
    const datos = datosValidos();
    datos.conductor = { ...datos.conductor, crewId: null };
    datos.cuadrilla = null;
    const { servicio, manager } = crearServicio(datos);

    await expect(servicio.crear(dto)).resolves.toBeDefined();
    const donde = (manager.find.mock.calls[0][1] as { where: Fila[] }).where;
    expect(donde).toHaveLength(3); // sin condición de cuadrilla
  });

  it('rechaza recursos ya ocupados en un horario que se cruza', async () => {
    const datos = datosValidos();
    datos.guardadas.push({
      id: 'previa',
      conductorId: 'drv-1',
      vehiculoId: 'veh-1',
      programacionId: 'otra',
      programacion: { microrutaId: 'otra-micro' },
      conductor: { crewId: 'otra-crew' },
      inicioProgramado: new Date('2026-12-15T14:00:00.000Z'), // cruza 14:00-16:00
      finProgramado: new Date('2026-12-15T16:00:00.000Z'),
    });
    const { servicio } = crearServicio(datos);

    const { error, details } = await detalles(servicio.crear(dto));

    expect(error).toBeInstanceOf(ConflictException);
    expect(
      details.map((d) => String(d.field)).sort((a, b) => a.localeCompare(b)),
    ).toEqual(['conductorId', 'vehiculoId']);
    expect(datos.guardadas).toHaveLength(1);
  });

  it('detecta conflicto de microruta y de cuadrilla', async () => {
    const datos = datosValidos();
    datos.guardadas.push({
      id: 'previa',
      conductorId: 'otro-drv',
      vehiculoId: 'otro-veh',
      programacion: { microrutaId: 'micro-1' },
      conductor: { crewId: 'crew-1' },
      inicioProgramado: new Date('2026-12-15T11:00:00.000Z'),
      finProgramado: new Date('2026-12-15T15:00:00.000Z'),
    });
    const { servicio } = crearServicio(datos);

    const { details } = await detalles(servicio.crear(dto));

    expect(details.map((d) => d.reason)).toEqual([
      'La microruta ya está asignada en ese horario.',
      'La cuadrilla del conductor ya está ocupada en ese horario.',
    ]);
  });

  it('permite el mismo vehículo cuando el horario no se cruza (queda adyacente)', async () => {
    const datos = datosValidos();
    datos.guardadas.push({
      id: 'previa',
      conductorId: 'drv-1',
      vehiculoId: 'veh-1',
      programacion: { microrutaId: 'micro-1' },
      conductor: { crewId: 'crew-1' },
      inicioProgramado: new Date('2026-12-15T15:00:00.000Z'), // empieza cuando termina la nueva
      finProgramado: new Date('2026-12-15T19:00:00.000Z'),
    });
    const { servicio } = crearServicio(datos);

    await expect(servicio.crear(dto)).resolves.toBeDefined();
    expect(datos.guardadas).toHaveLength(2);
  });

  it('dos solicitudes simultáneas no crean doble asignación', async () => {
    const datos = datosValidos();
    const { servicio } = crearServicio(datos, true);

    const resultados = await Promise.allSettled([
      servicio.crear(dto),
      servicio.crear(dto),
    ]);

    const rechazadas = resultados.filter((r) => r.status === 'rejected');
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(rechazadas).toHaveLength(1);
    expect((rechazadas[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      ConflictException,
    );
    expect(datos.guardadas).toHaveLength(1);
  });

  it('traduce una violación única de PostgreSQL (23505) a 409', async () => {
    const datos = datosValidos();
    const { servicio, manager } = crearServicio(datos);
    manager.save.mockRejectedValueOnce({ driverError: { code: '23505' } });

    await expect(servicio.crear(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('propaga errores inesperados sin convertirlos', async () => {
    const datos = datosValidos();
    const { servicio, manager } = crearServicio(datos);
    manager.save.mockRejectedValueOnce(new Error('caída de BD'));

    await expect(servicio.crear(dto)).rejects.toThrow('caída de BD');
  });
});

describe('AsignacionesService consultas', () => {
  it('lista asignaciones', async () => {
    const { servicio, repositorio } = crearServicio(datosValidos());
    repositorio.find.mockResolvedValue(['a']);

    await expect(servicio.listar()).resolves.toEqual(['a']);
  });

  it('obtiene el detalle y responde 404 si no existe', async () => {
    const { servicio, repositorio } = crearServicio(datosValidos());
    repositorio.findOne.mockResolvedValueOnce({ id: 'x' });
    repositorio.findOne.mockResolvedValueOnce(null);

    await expect(servicio.obtener('x')).resolves.toEqual({ id: 'x' });
    await expect(servicio.obtener('y')).rejects.toThrow(
      new NotFoundException('Asignación no encontrada.'),
    );
  });
});
