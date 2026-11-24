import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { EstadoVehiculo } from '../entidades/vehiculo.entity';
import { ActualizarEstadoVehiculoDto } from './actualizar-estado-vehiculo.dto';
import { ActualizarTipoVehiculoDto } from './actualizar-tipo-vehiculo.dto';
import { ActualizarVehiculoDto } from './actualizar-vehiculo.dto';
import { ConsultarVehiculosDto } from './consultar-vehiculos.dto';
import { CrearTipoVehiculoDto } from './crear-tipo-vehiculo.dto';
import { CrearVehiculoDto } from './crear-vehiculo.dto';

describe('DTOs de VehÃ­culos', () => {
  it('normaliza filtros, booleanos y paginaciÃ³n en ConsultarVehiculosDto', async () => {
    const dto = plainToInstance(ConsultarVehiculosDto, {
      status: EstadoVehiculo.DISPONIBLE,
      vehicleTypeId: '00000000-0000-4000-8000-000000000001',
      plate: ' abc12 ',
      isActive: 'true',
      onlyAssignable: 'false',
      page: '2',
      limit: '15',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.plate).toBe('ABC12');
    expect(dto.isActive).toBe(true);
    expect(dto.onlyAssignable).toBe(false);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(15);

    const emptyDto = plainToInstance(ConsultarVehiculosDto, {
      isActive: '',
      onlyAssignable: true,
    });
    expect(emptyDto.isActive).toBeUndefined();
    expect(emptyDto.onlyAssignable).toBe(true);
  });

  it('valida CrearVehiculoDto y ActualizarVehiculoDto con normalizaciÃ³n', async () => {
    const crear = plainToInstance(CrearVehiculoDto, {
      vehicleTypeId: '00000000-0000-4000-8000-000000000001',
      vehicleStatus: EstadoVehiculo.DISPONIBLE,
      plate: ' abc123 ',
      capacityKg: '8500.5',
      capacityYd3: '16',
      reason: '  Alta inicial  ',
    });
    expect(await validate(crear)).toHaveLength(0);
    expect(crear.plate).toBe('ABC123');
    expect(crear.reason).toBe('Alta inicial');

    const actualizar = plainToInstance(ActualizarVehiculoDto, {
      plate: ' xyz789 ',
      reason: '  Cambio de placa  ',
    });
    expect(await validate(actualizar)).toHaveLength(0);
    expect(actualizar.plate).toBe('XYZ789');
  });

  it('valida ActualizarEstadoVehiculoDto y DTOs de tipo de vehÃ­culo', async () => {
    const estadoDto = plainToInstance(ActualizarEstadoVehiculoDto, {
      vehicleStatus: EstadoVehiculo.FUERA_DE_SERVICIO,
      reason: '  Falla de transmisiÃ³n  ',
    });
    expect(await validate(estadoDto)).toHaveLength(0);
    expect(estadoDto.reason).toBe('Falla de transmisiÃ³n');

    const crearTipo = plainToInstance(CrearTipoVehiculoDto, {
      code: ' comp ',
      name: '  Compactador  ',
    });
    expect(await validate(crearTipo)).toHaveLength(0);
    expect(crearTipo.code).toBe('COMP');
    expect(crearTipo.name).toBe('Compactador');

    const actTipo = plainToInstance(ActualizarTipoVehiculoDto, {
      code: ' volq ',
      name: '  Volqueta  ',
      isActive: false,
    });
    expect(await validate(actTipo)).toHaveLength(0);
    expect(actTipo.code).toBe('VOLQ');
  });
});
