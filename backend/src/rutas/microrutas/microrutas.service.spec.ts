import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, QueryFailedError } from 'typeorm';
import { Barrio } from '../barrios/entities/barrios.entity';
import { Macroruta } from '../macrorutas/entities/macroruta.entity';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { MicrorutaBarrio } from './entities/microruta-barrio.entity';
import { Microruta } from './entities/microruta.entity';
import { MicrorutasService } from './microrutas.service';
import { crearValidationPipe } from '../../common/validacion';

describe('MicrorutasService', () => {
  const repositorioMicrorutas = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const repositorioMicrorutaBarrios = {
    find: jest.fn(),
    create: jest.fn(
      (datos: Partial<MicrorutaBarrio>) => datos as MicrorutaBarrio,
    ),
    save: jest.fn(),
  };
  const queryBuilder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawAndEntities: jest.fn(),
  };
  const repositorioMacrorutas = {
    findOne: jest.fn(),
  };
  const repositorioBarrios = {
    find: jest.fn(),
  };

  let moduleRef: TestingModule;
  let servicio: MicrorutasService;
  const geom = {
    type: 'MultiLineString',
    coordinates: [
      [
        [-76.53, 3.43],
        [-76.52, 3.44],
      ],
    ],
  };

  function mockDetalle(microruta: Microruta): void {
    queryBuilder.getRawAndEntities.mockResolvedValue({
      entities: [microruta],
      raw: [{ geom_json: geom }],
    });
  }

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        MicrorutasService,
        {
          provide: getRepositoryToken(Microruta),
          useValue: repositorioMicrorutas,
        },
        {
          provide: getRepositoryToken(MicrorutaBarrio),
          useValue: repositorioMicrorutaBarrios,
        },
        {
          provide: getRepositoryToken(Macroruta),
          useValue: repositorioMacrorutas,
        },
        {
          provide: getRepositoryToken(Barrio),
          useValue: repositorioBarrios,
        },
      ],
    }).compile();
    servicio = moduleRef.get(MicrorutasService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    repositorioMicrorutaBarrios.find.mockResolvedValue([]);
  });

  it('falla con 404 si la macroruta no existe y no guarda la microruta', async () => {
    repositorioMacrorutas.findOne.mockResolvedValue(null);

    await expect(
      servicio.crear({
        macrorutaId: 'macro-id',
        nombre: 'Ruta',
        codigo: 'm-001',
        geom,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(queryBuilder.execute).not.toHaveBeenCalled();
  });

  it('lista las microrutas desde el repositorio', async () => {
    const microrutas = [{ id: 'micro-id' }] as Microruta[];
    repositorioMicrorutas.find.mockResolvedValue(microrutas);

    await expect(servicio.listar()).resolves.toBe(microrutas);
    expect(repositorioMicrorutas.find).toHaveBeenCalledWith();
  });

  it('crea una microruta con macroruta válida y asigna sus campos iniciales', async () => {
    const macroruta = { id: 'macro-id' } as Macroruta;
    repositorioMacrorutas.findOne.mockResolvedValue(macroruta);
    queryBuilder.execute.mockResolvedValue({ raw: [{ id: 'micro-id' }] });
    const entidad = {
      id: 'micro-id',
      nombre: 'Ruta',
      codigo: 'm-001',
      macroruta,
      activo: true,
    } as Microruta;
    mockDetalle(entidad);

    const creada = await servicio.crear({
      macrorutaId: macroruta.id,
      nombre: 'Ruta',
      codigo: 'm-001',
      geom,
    });

    expect(queryBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Ruta',
        codigo: 'm-001',
        macroruta: { id: macroruta.id },
        activo: true,
        geom: expect.any(Function),
      }),
    );
    expect(queryBuilder.setParameter).toHaveBeenCalledWith(
      'geom',
      JSON.stringify(geom),
    );
    expect(creada).toEqual(expect.objectContaining({ geom }));
    expect(creada).not.toHaveProperty('barrios');
  });

  it('responde 409 cuando el código de microruta ya existe', async () => {
    const macroruta = { id: 'macro-id' } as Macroruta;
    repositorioMacrorutas.findOne.mockResolvedValue(macroruta);
    queryBuilder.execute.mockRejectedValue(
      new QueryFailedError('INSERT', [], { code: '23505' }),
    );

    await expect(
      servicio.crear({
        macrorutaId: macroruta.id,
        nombre: 'Ruta',
        codigo: 'm-001',
        geom,
      }),
    ).rejects.toThrow(
      new ConflictException('El código de la microruta ya existe.'),
    );
  });

  it('responde 400 cuando PostGIS rechaza la geometría de microruta', async () => {
    const macroruta = { id: 'macro-id' } as Macroruta;
    repositorioMacrorutas.findOne.mockResolvedValue(macroruta);
    queryBuilder.execute.mockRejectedValue(
      new QueryFailedError('INSERT', [], { code: '22P02' }),
    );

    await expect(
      servicio.crear({
        macrorutaId: macroruta.id,
        nombre: 'Ruta',
        codigo: 'm-001',
        geom,
      }),
    ).rejects.toThrow(
      new BadRequestException('geom no es un GeoJSON válido.'),
    );
  });

  it('devuelve los barrios del detalle ordenados por ordenVisita', async () => {
    const microruta = {
      id: 'micro-id',
      macroruta: { id: 'macro-id' },
    } as Microruta;
    const relaciones = [
      { ordenVisita: 3, barrio: { id: 'barrio-3' } },
      { ordenVisita: 1, barrio: { id: 'barrio-1' } },
      { ordenVisita: 2, barrio: { id: 'barrio-2' } },
    ] as MicrorutaBarrio[];
    mockDetalle(microruta);
    repositorioMicrorutaBarrios.find.mockResolvedValue(relaciones);

    const detalle = await servicio.obtener(microruta.id);

    expect(detalle.macroruta).toEqual(microruta.macroruta);
    expect(detalle.barrios.map(({ ordenVisita }) => ordenVisita)).toEqual([
      1, 2, 3,
    ]);
    expect(repositorioMicrorutaBarrios.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { ordenVisita: 'ASC' },
      }),
    );
  });

  it('falla con 404 al pedir el detalle de una microruta inexistente', async () => {
    queryBuilder.getRawAndEntities.mockResolvedValue({
      entities: [],
      raw: [],
    });

    await expect(servicio.obtener('desconocida')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repositorioMicrorutaBarrios.find).not.toHaveBeenCalled();
  });

  it('falla con 404 al asociar barrios a una microruta inexistente', async () => {
    repositorioMicrorutas.findOne.mockResolvedValue(null);

    await expect(
      servicio.asociarBarrios('desconocida', {
        barrios: [{ barrioId: 'barrio-id', ordenVisita: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repositorioBarrios.find).not.toHaveBeenCalled();
  });

  it('falla con 404 y no guarda si falta un barrio al asociar', async () => {
    repositorioMicrorutas.findOne.mockResolvedValue({ id: 'micro-id' });
    repositorioBarrios.find.mockResolvedValue([]);

    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [{ barrioId: 'barrio-id', ordenVisita: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repositorioMicrorutaBarrios.save).not.toHaveBeenCalled();
  });

  it('rechaza barrios repetidos sin consultar barrios ni guardar', async () => {
    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [
          { barrioId: 'barrio-id', ordenVisita: 1 },
          { barrioId: 'barrio-id', ordenVisita: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repositorioBarrios.find).not.toHaveBeenCalled();
    expect(repositorioMicrorutaBarrios.save).not.toHaveBeenCalled();
  });

  it('rejects repeated visit orders without saving', async () => {
    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [
          { barrioId: 'barrio-1', ordenVisita: 1 },
          { barrioId: 'barrio-2', ordenVisita: 1 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repositorioMicrorutas.findOne).not.toHaveBeenCalled();
    expect(repositorioBarrios.find).not.toHaveBeenCalled();
    expect(repositorioMicrorutaBarrios.save).not.toHaveBeenCalled();
  });

  it('rechaza barrios ya asociados sin guardar', async () => {
    repositorioMicrorutas.findOne.mockResolvedValue({ id: 'micro-id' });
    repositorioBarrios.find.mockResolvedValue([{ id: 'barrio-id' }]);
    repositorioMicrorutaBarrios.find.mockResolvedValueOnce([
      { barrio: { id: 'barrio-id' }, ordenVisita: 1 },
    ]);

    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [{ barrioId: 'barrio-id', ordenVisita: 1 }],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repositorioMicrorutaBarrios.save).not.toHaveBeenCalled();
  });

  it('guarda las asociaciones válidas y devuelve el detalle', async () => {
    const microruta = { id: 'micro-id' } as Microruta;
    const barrio = { id: 'barrio-id' } as Barrio;
    repositorioMicrorutas.findOne.mockResolvedValue(microruta);
    repositorioBarrios.find.mockResolvedValue([barrio]);
    repositorioMicrorutaBarrios.find
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ barrio, ordenVisita: 1 }]);
    mockDetalle(microruta);

    const detalle = await servicio.asociarBarrios('micro-id', {
      barrios: [{ barrioId: barrio.id, ordenVisita: 1 }],
    });

    expect(repositorioMicrorutaBarrios.save).toHaveBeenCalledWith([
      expect.objectContaining({
        microruta,
        barrio,
        ordenVisita: 1,
      }),
    ]);
    expect(detalle.barrios[0].barrio).toEqual(barrio);
  });

  it('asocia un barrio si su UUID se proporciona en mayúsculas', async () => {
    const microruta = { id: 'micro-id' } as Microruta;
    const barrioId = '09b2c3dc-0035-4e29-aa18-d9a4e803191d';
    const barrio = { id: barrioId } as Barrio;
    repositorioMicrorutas.findOne.mockResolvedValue(microruta);
    repositorioBarrios.find.mockResolvedValue([barrio]);
    repositorioMicrorutaBarrios.find
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ barrio, ordenVisita: 1 }]);
    mockDetalle(microruta);

    await servicio.asociarBarrios('micro-id', {
      barrios: [{ barrioId: barrioId.toUpperCase(), ordenVisita: 1 }],
    });

    expect(repositorioBarrios.find).toHaveBeenCalledWith({
      where: { id: In([barrioId]) },
    });
    expect(repositorioMicrorutaBarrios.create).toHaveBeenCalledWith({
      microruta,
      barrio,
      ordenVisita: 1,
    });
  });

  it('rechaza UUIDs repetidos aunque difieran en mayúsculas', async () => {
    const barrioId = '09b2c3dc-0035-4e29-aa18-d9a4e803191d';

    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [
          { barrioId, ordenVisita: 1 },
          { barrioId: barrioId.toUpperCase(), ordenVisita: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repositorioBarrios.find).not.toHaveBeenCalled();
    expect(repositorioMicrorutaBarrios.save).not.toHaveBeenCalled();
  });

  it('responde 409 si guardar falla por una asociación duplicada', async () => {
    const microruta = { id: 'micro-id' } as Microruta;
    const barrio = { id: 'barrio-id' } as Barrio;
    repositorioMicrorutas.findOne.mockResolvedValue(microruta);
    repositorioBarrios.find.mockResolvedValue([barrio]);
    repositorioMicrorutaBarrios.find.mockResolvedValue([]);
    repositorioMicrorutaBarrios.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], {
        code: '23505',
        constraint: 'uq_microroute_neighborhood',
      }),
    );

    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [{ barrioId: barrio.id, ordenVisita: 1 }],
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Uno o más barrios ya están asociados a la microruta.',
      ),
    );
  });

  it('returns 409 when the visit order constraint fails', async () => {
    const microruta = { id: 'micro-id' } as Microruta;
    const barrio = { id: 'barrio-id' } as Barrio;
    repositorioMicrorutas.findOne.mockResolvedValue(microruta);
    repositorioBarrios.find.mockResolvedValue([barrio]);
    repositorioMicrorutaBarrios.find.mockResolvedValue([]);
    repositorioMicrorutaBarrios.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], {
        code: '23505',
        constraint: 'uq_microroute_neighborhood_order',
      }),
    );

    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [{ barrioId: barrio.id, ordenVisita: 1 }],
      }),
    ).rejects.toThrow(
      new ConflictException(
        'Uno o más órdenes de visita ya están en uso en la microruta.',
      ),
    );
  });

  it('rethrows unique violations from other constraints', async () => {
    const microruta = { id: 'micro-id' } as Microruta;
    const barrio = { id: 'barrio-id' } as Barrio;
    const error = new QueryFailedError('INSERT', [], {
      code: '23505',
      constraint: 'some_other_constraint',
    });
    repositorioMicrorutas.findOne.mockResolvedValue(microruta);
    repositorioBarrios.find.mockResolvedValue([barrio]);
    repositorioMicrorutaBarrios.find.mockResolvedValue([]);
    repositorioMicrorutaBarrios.save.mockRejectedValue(error);

    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [{ barrioId: barrio.id, ordenVisita: 1 }],
      }),
    ).rejects.toBe(error);
  });

  it('relanza los errores distintos a una violación de unicidad al guardar', async () => {
    const microruta = { id: 'micro-id' } as Microruta;
    const barrio = { id: 'barrio-id' } as Barrio;
    const error = new Error('Error al guardar');
    repositorioMicrorutas.findOne.mockResolvedValue(microruta);
    repositorioBarrios.find.mockResolvedValue([barrio]);
    repositorioMicrorutaBarrios.find.mockResolvedValue([]);
    repositorioMicrorutaBarrios.save.mockRejectedValue(error);

    await expect(
      servicio.asociarBarrios('micro-id', {
        barrios: [{ barrioId: barrio.id, ordenVisita: 1 }],
      }),
    ).rejects.toBe(error);
  });

  it('rechaza entradas inválidas con el ValidationPipe global', async () => {
    const validationPipe = crearValidationPipe();
    const opciones = {
      type: 'body' as const,
      metatype: CrearMicrorutaDto,
    };

    await expect(
      validationPipe.transform(
        { macrorutaId: 'no-es-uuid', nombre: '' },
        opciones,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza propiedades desconocidas y acepta geom como campo del DTO', async () => {
    const validationPipe = crearValidationPipe();

    await expect(
      validationPipe.transform(
        {
          macrorutaId: '09b2c3dc-0035-4e29-aa18-d9a4e803191d',
          nombre: 'Ruta',
          codigo: 'm-001',
          geom,
          extra: true,
        },
        { type: 'body', metatype: CrearMicrorutaDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('acepta codigo y geom válidos en el DTO de creación', async () => {
    const validationPipe = crearValidationPipe();

    await expect(
      validationPipe.transform(
        {
          macrorutaId: '09b2c3dc-0035-4e29-aa18-d9a4e803191d',
          nombre: 'Ruta',
          codigo: 'm-001',
          geom,
        },
        { type: 'body', metatype: CrearMicrorutaDto },
      ),
    ).resolves.toEqual({
      macrorutaId: '09b2c3dc-0035-4e29-aa18-d9a4e803191d',
      nombre: 'Ruta',
      codigo: 'm-001',
      geom,
    });
  });
});
