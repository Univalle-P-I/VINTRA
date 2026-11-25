import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { CrearMacrorutaDto } from './dto/crear-macroruta.dto';
import { Macroruta } from './entities/macroruta.entity';
import { MacrorutasService } from './macrorutas.service';

describe('MacrorutasService', () => {
  const queryBuilder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawAndEntities: jest.fn(),
  };
  const repositorio = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    find: jest.fn(),
  };
  let moduleRef: TestingModule;
  let servicio: MacrorutasService;

  const dto: CrearMacrorutaDto = {
    nombre: 'Centro',
    codigo: 'M-001',
    geom: {
      type: 'MultiLineString',
      coordinates: [
        [
          [-76.53, 3.43],
          [-76.52, 3.44],
        ],
      ],
    },
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        MacrorutasService,
        { provide: getRepositoryToken(Macroruta), useValue: repositorio },
      ],
    }).compile();
    servicio = moduleRef.get(MacrorutasService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserta code y geom y devuelve la macroruta creada', async () => {
    const geom = dto.geom;
    const macroruta = {
      id: 'macro-id',
      nombre: dto.nombre,
      codigo: dto.codigo,
      activo: true,
    } as Macroruta;
    queryBuilder.execute.mockResolvedValue({ raw: [{ id: 'macro-id' }] });
    queryBuilder.getRawAndEntities.mockResolvedValue({
      entities: [macroruta],
      raw: [{ geom_json: geom }],
    });

    await expect(servicio.crear(dto)).resolves.toBe(macroruta);

    expect(queryBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: dto.nombre,
        codigo: dto.codigo,
        activo: true,
        geom: expect.any(Function),
      }),
    );
    expect(queryBuilder.setParameter).toHaveBeenCalledWith(
      'geom',
      JSON.stringify(dto.geom),
    );
    expect(queryBuilder.returning).toHaveBeenCalledWith('id');
    expect(macroruta.geom).toBe(geom);
  });

  it('responde 409 cuando el código ya existe', async () => {
    queryBuilder.execute.mockRejectedValue(
      new QueryFailedError('INSERT', [], { code: '23505' }),
    );

    await expect(servicio.crear(dto)).rejects.toThrow(
      new ConflictException('El código de la macroruta ya existe.'),
    );
  });

  it('responde 400 cuando PostGIS rechaza la geometría', async () => {
    queryBuilder.execute.mockRejectedValue(
      new QueryFailedError('INSERT', [], { code: 'XX000' }),
    );

    await expect(servicio.crear(dto)).rejects.toThrow(
      new BadRequestException('geom no es un GeoJSON válido.'),
    );
  });

  it('lista las macrorutas desde el repositorio', async () => {
    const macrorutas = [{ id: 'macro-id' }] as Macroruta[];
    repositorio.find.mockResolvedValue(macrorutas);

    await expect(servicio.listar()).resolves.toBe(macrorutas);
    expect(repositorio.find).toHaveBeenCalledWith();
  });

  it('obtiene por id y falla con 404 cuando no existe', async () => {
    const macroruta = { id: 'macro-id' } as Macroruta;
    queryBuilder.getRawAndEntities
      .mockResolvedValueOnce({
        entities: [macroruta],
        raw: [{ geom_json: { type: 'MultiLineString' } }],
      })
      .mockResolvedValueOnce({ entities: [], raw: [] });

    await expect(servicio.obtener('macro-id')).resolves.toBe(macroruta);
    expect(queryBuilder.where).toHaveBeenNthCalledWith(
      1,
      'macroruta.id = :id',
      { id: 'macro-id' },
    );
    await expect(servicio.obtener('desconocida')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
