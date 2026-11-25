import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Barrio } from './entities/barrios.entity';
import { BarriosService } from './barrios.service';

describe('BarriosService', () => {
  const repositorio = {
    find: jest.fn(),
    findOne: jest.fn(),
  };
  let moduleRef: TestingModule;
  let servicio: BarriosService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        BarriosService,
        { provide: getRepositoryToken(Barrio), useValue: repositorio },
      ],
    }).compile();
    servicio = moduleRef.get(BarriosService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lista los barrios desde el repositorio', async () => {
    const barrios = [{ id: 'barrio-id' }] as Barrio[];
    repositorio.find.mockResolvedValue(barrios);

    await expect(servicio.listar()).resolves.toBe(barrios);
    expect(repositorio.find).toHaveBeenCalledWith();
  });

  it('obtiene por id y falla con 404 cuando no existe', async () => {
    const barrio = { id: 'barrio-id' } as Barrio;
    repositorio.findOne.mockResolvedValueOnce(barrio).mockResolvedValueOnce(null);

    await expect(servicio.obtener('barrio-id')).resolves.toBe(barrio);
    expect(repositorio.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 'barrio-id' },
    });
    await expect(servicio.obtener('desconocido')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repositorio.findOne).toHaveBeenLastCalledWith({
      where: { id: 'desconocido' },
    });
  });
});
