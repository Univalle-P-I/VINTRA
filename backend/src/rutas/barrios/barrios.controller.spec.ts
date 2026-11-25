import { BarriosController } from './barrios.controller';
import { BarriosService } from './barrios.service';

describe('BarriosController', () => {
  it('delega listado y detalle al servicio', () => {
    const servicio = {
      listar: jest.fn().mockReturnValue('listado'),
      obtener: jest.fn().mockReturnValue('detalle'),
    };
    const controller = new BarriosController(
      servicio as unknown as BarriosService,
    );

    expect(controller.listar()).toBe('listado');
    expect(servicio.listar).toHaveBeenCalledWith();
    expect(controller.obtener('barrio-id')).toBe('detalle');
    expect(servicio.obtener).toHaveBeenCalledWith('barrio-id');
  });
});
