import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { roles } from '../common/enums/roles.enum';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { CrearAsignacionDto } from './dto/crear-asignacion.dto';

describe('AsignacionesController', () => {
  it('delega creación, listado y detalle con sus argumentos', () => {
    const servicio = {
      crear: jest.fn().mockReturnValue('creada'),
      listar: jest.fn().mockReturnValue('listado'),
      obtener: jest.fn().mockReturnValue('detalle'),
    };
    const controller = new AsignacionesController(
      servicio as unknown as AsignacionesService,
    );
    const dto = { conductorId: 'c' } as CrearAsignacionDto;

    expect(controller.crear(dto)).toBe('creada');
    expect(servicio.crear).toHaveBeenCalledWith(dto);
    expect(controller.listar()).toBe('listado');
    expect(controller.obtener('id')).toBe('detalle');
    expect(servicio.obtener).toHaveBeenCalledWith('id');
  });

  it('solo permite a administradores y operadores', () => {
    const requeridos = new Reflector().get<roles[]>(
      ROLES_KEY,
      AsignacionesController,
    );

    expect(requeridos).toEqual([roles.ADMIN, roles.OPERATOR]);
  });
});
