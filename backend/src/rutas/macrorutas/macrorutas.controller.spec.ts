import { MacrorutasController } from './macrorutas.controller';
import { MacrorutasService } from './macrorutas.service';

describe('MacrorutasController', () => {
  it('delega creación, listado y detalle al servicio', () => {
    const servicio = {
      crear: jest.fn().mockReturnValue('creada'),
      listar: jest.fn().mockReturnValue('listado'),
      obtener: jest.fn().mockReturnValue('detalle'),
    };
    const controller = new MacrorutasController(
      servicio as unknown as MacrorutasService,
    );
    const dto = {
      nombre: 'Centro',
      codigo: 'M-001',
      geom: { type: 'MultiLineString', coordinates: [] },
    };

    expect(controller.crear(dto)).toBe('creada');
    expect(servicio.crear).toHaveBeenCalledWith(dto);
    expect(controller.listar()).toBe('listado');
    expect(servicio.listar).toHaveBeenCalledWith();
    expect(controller.obtener('macro-id')).toBe('detalle');
    expect(servicio.obtener).toHaveBeenCalledWith('macro-id');
  });
});
