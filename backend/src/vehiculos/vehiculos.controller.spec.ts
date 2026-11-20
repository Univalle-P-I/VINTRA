import type { AuthenticatedUser } from '../autenticacion/authenticated-user';
import { RolUsuario } from '../perfiles/entidades/perfil.entity';
import { EstadoUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { VehiculosController } from './vehiculos.controller';
import type { VehiculosService } from './vehiculos.service';

describe('VehiculosController', () => {
  const actor: AuthenticatedUser = {
    userId: '11111111-1111-4111-8111-111111111111',
    sessionId: '22222222-2222-4222-8222-222222222222',
    email: 'admin@vintra.local',
    role: RolUsuario.ADMIN,
    status: EstadoUsuario.ACTIVE,
  };

  const listarTiposMock = jest.fn().mockResolvedValue([]);
  const crearTipoMock = jest.fn().mockResolvedValue({ id: 'tipo-1' });
  const actualizarTipoMock = jest.fn().mockResolvedValue({ id: 'tipo-1' });
  const listarMock = jest.fn().mockResolvedValue({ items: [], total: 0 });
  const obtenerMock = jest.fn().mockResolvedValue({ id: 'veh-1' });
  const crearMock = jest.fn().mockResolvedValue({ id: 'veh-1' });
  const actualizarMock = jest.fn().mockResolvedValue({ id: 'veh-1' });

  const vehiculosService = {
    listarTipos: listarTiposMock,
    crearTipo: crearTipoMock,
    actualizarTipo: actualizarTipoMock,
    listar: listarMock,
    obtener: obtenerMock,
    crear: crearMock,
    actualizar: actualizarMock,
  } as unknown as VehiculosService;

  const controller = new VehiculosController(vehiculosService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delega todas las operaciones al servicio de vehiculos', async () => {
    await expect(controller.listarTipos()).resolves.toEqual([]);
    expect(listarTiposMock).toHaveBeenCalledTimes(1);

    const crearTipoDto = { name: 'Compactador', code: 'COMP' } as never;
    await expect(
      controller.crearTipo(crearTipoDto, actor, '127.0.0.1'),
    ).resolves.toEqual({ id: 'tipo-1' });
    expect(crearTipoMock).toHaveBeenCalledWith(
      crearTipoDto,
      actor.userId,
      '127.0.0.1',
    );

    const actualizarTipoDto = { name: 'Compactador Grande' } as never;
    await expect(
      controller.actualizarTipo('tipo-1', actualizarTipoDto, actor, '127.0.0.1'),
    ).resolves.toEqual({ id: 'tipo-1' });
    expect(actualizarTipoMock).toHaveBeenCalledWith(
      'tipo-1',
      actualizarTipoDto,
      actor.userId,
      '127.0.0.1',
    );

    const filtros = { page: 1, limit: 10 } as never;
    await expect(controller.listar(filtros, actor)).resolves.toEqual({
      items: [],
      total: 0,
    });
    expect(listarMock).toHaveBeenCalledWith(filtros, actor.userId);

    await expect(controller.obtener('veh-1')).resolves.toEqual({ id: 'veh-1' });
    expect(obtenerMock).toHaveBeenCalledWith('veh-1');

    const crearVehiculoDto = { plate: 'ABC123' } as never;
    await expect(
      controller.crear(crearVehiculoDto, actor, '127.0.0.1'),
    ).resolves.toEqual({ id: 'veh-1' });
    expect(crearMock).toHaveBeenCalledWith(
      crearVehiculoDto,
      actor.userId,
      '127.0.0.1',
    );

    const actualizarVehiculoDto = { plate: 'XYZ789' } as never;
    await expect(
      controller.actualizar('veh-1', actualizarVehiculoDto, actor, '127.0.0.1'),
    ).resolves.toEqual({ id: 'veh-1' });
    expect(actualizarMock).toHaveBeenCalledWith(
      'veh-1',
      actualizarVehiculoDto,
      actor.userId,
      '127.0.0.1',
    );
  });
});