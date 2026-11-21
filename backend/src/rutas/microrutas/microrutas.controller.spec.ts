import { AsociarBarriosDto } from './dto/asociar-barrios.dto';
import { CrearMicrorutaDto } from './dto/crear-microruta.dto';
import { MicrorutasController } from './microrutas.controller';
import { MicrorutasService } from './microrutas.service';

describe('MicrorutasController', () => {
  it('delega creación, listado, detalle y asociación con sus argumentos', () => {
    const servicio = {
      crear: jest.fn().mockReturnValue('creada'),
      listar: jest.fn().mockReturnValue('listado'),
      obtener: jest.fn().mockReturnValue('detalle'),
      asociarBarrios: jest.fn().mockReturnValue('asociados'),
    };
    const controller = new MicrorutasController(
      servicio as unknown as MicrorutasService,
    );
    const crearDto = { macrorutaId: 'macro-id', nombre: 'Ruta' };
    const asociarDto = { barrios: [{ barrioId: 'barrio-id', ordenVisita: 1 }] };

    expect(controller.crear(crearDto as CrearMicrorutaDto)).toBe('creada');
    expect(servicio.crear).toHaveBeenCalledWith(crearDto);
    expect(controller.listar()).toBe('listado');
    expect(servicio.listar).toHaveBeenCalledWith();
    expect(controller.obtener('micro-id')).toBe('detalle');
    expect(servicio.obtener).toHaveBeenCalledWith('micro-id');
    expect(
      controller.asociarBarrios('micro-id', asociarDto as AsociarBarriosDto),
    ).toBe('asociados');
    expect(servicio.asociarBarrios).toHaveBeenCalledWith(
      'micro-id',
      asociarDto,
    );
  });
});
