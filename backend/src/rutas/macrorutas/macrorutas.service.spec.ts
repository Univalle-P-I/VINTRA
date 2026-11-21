import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Macroruta } from './entities/macroruta.entity';
import { MacrorutasService } from './macrorutas.service';

describe('MacrorutasService', () => {
  const repositorio = {
    create: jest.fn((datos: Partial<Macroruta>) => datos as Macroruta),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  let moduleRef: TestingModule;
  let servicio: MacrorutasService;

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

  it('crea y guarda la macroruta activa con el nombre solicitado', async () => {
    const macroruta = { nombre: 'Centro', activo: true } as Macroruta;
    repositorio.save.mockResolvedValue(macroruta);

    await expect(servicio.crear({ nombre: 'Centro' })).resolves.toBe(macroruta);

    const datos = repositorio.create.mock.calls[0][0];
    expect(datos).toEqual(
      expect.objectContaining({
        nombre: 'Centro',
        activo: true,
        creadoEn: expect.any(Date),
        actualizadoEn: expect.any(Date),
      }),
    );
    expect(datos.actualizadoEn).toBe(datos.creadoEn);
    expect(repositorio.save).toHaveBeenCalledWith(datos);
  });

  it('lista las macrorutas desde el repositorio', async () => {
    const macrorutas = [{ id: 'macro-id' }] as Macroruta[];
    repositorio.find.mockResolvedValue(macrorutas);

    await expect(servicio.listar()).resolves.toBe(macrorutas);
    expect(repositorio.find).toHaveBeenCalledWith();
  });

  it('obtiene por id y falla con 404 cuando no existe', async () => {
    const macroruta = { id: 'macro-id' } as Macroruta;
    repositorio.findOne.mockResolvedValueOnce(macroruta).mockResolvedValueOnce(null);

    await expect(servicio.obtener('macro-id')).resolves.toBe(macroruta);
    expect(repositorio.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 'macro-id' },
    });
    await expect(servicio.obtener('desconocida')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repositorio.findOne).toHaveBeenLastCalledWith({
      where: { id: 'desconocida' },
    });
  });
});
