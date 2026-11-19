import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Barrio } from '../barrios/entities/barrios.entity';
import { Macroruta } from '../macrorutas/entities/macroruta.entity';
import { AsociarBarriosDto } from './dto/asociar-barrios.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { MicrorutaBarrio } from './entities/microruta-barrio.entity';
import { Microruta } from './entities/microruta.entity';
import { MicrorutasService } from './microrutas.service';
import { crearValidationPipe } from '../../common/validacion';

describe('MicrorutasService', () => {
  const repositorioMicrorutas = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((datos: Partial<Microruta>) => datos as Microruta),
    save: jest.fn(),
  };
  const repositorioMicrorutaBarrios = {
    find: jest.fn(),
    create: jest.fn(
      (datos: Partial<MicrorutaBarrio>) => datos as MicrorutaBarrio,
    ),
    save: jest.fn(),
  };
  const repositorioMacrorutas = {
    findOne: jest.fn(),
  };
  const repositorioBarrios = {
    find: jest.fn(),
  };

  let moduleRef: TestingModule;
  let servicio: MicrorutasService;

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
  });

  it('falla con 404 si la macroruta no existe y no guarda la microruta', async () => {
    repositorioMacrorutas.findOne.mockResolvedValue(null);

    await expect(
      servicio.crear({ macrorutaId: 'macro-id', nombre: 'Ruta' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repositorioMicrorutas.save).not.toHaveBeenCalled();
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

    await servicio.crear({
      macrorutaId: macroruta.id,
      nombre: 'Ruta',
    });

    expect(repositorioMicrorutas.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Ruta',
        macroruta,
        activo: true,
        creadoEn: expect.any(Date),
        actualizadoEn: expect.any(Date),
      }),
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
    repositorioMicrorutas.findOne.mockResolvedValue(microruta);
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
    repositorioMicrorutas.findOne.mockResolvedValue(null);

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

  it('rechaza un cambio concurrente del DTO antes de crear relaciones', async () => {
    const microruta = { id: 'micro-id' } as Microruta;
    const barrio = { id: 'barrio-id' } as Barrio;
    const dto = {
      barrios: [{ barrioId: barrio.id, ordenVisita: 1 }],
    } as AsociarBarriosDto & {
      barrios: { barrioId: string; ordenVisita: number }[];
    };
    repositorioMicrorutas.findOne.mockImplementation(async () => {
      dto.barrios = [{ barrioId: 'barrio-cambiado', ordenVisita: 2 }];
      return microruta;
    });
    repositorioBarrios.find.mockResolvedValue([barrio]);
    repositorioMicrorutaBarrios.find.mockResolvedValue([]);

    await expect(
      servicio.asociarBarrios('micro-id', dto),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repositorioMicrorutaBarrios.create).not.toHaveBeenCalled();
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

  it('rechaza propiedades desconocidas, incluida geom', async () => {
    const validationPipe = crearValidationPipe();

    await expect(
      validationPipe.transform(
        {
          macrorutaId: '09b2c3dc-0035-4e29-aa18-d9a4e803191d',
          nombre: 'Ruta',
          geom: 'no aceptada',
        },
        { type: 'body', metatype: CrearMicrorutaDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
