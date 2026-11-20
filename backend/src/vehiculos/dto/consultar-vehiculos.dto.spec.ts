import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { EstadoVehiculo } from '../entidades/vehiculo.entity';
import { ConsultarVehiculosDto } from './consultar-vehiculos.dto';

describe('ConsultarVehiculosDto', () => {
  it('acepta una consulta vac?a sin filtros', async () => {
    const dto = plainToInstance(ConsultarVehiculosDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('transforma y valida par?metros de filtro y paginaci?n v?lidos', async () => {
    const dto = plainToInstance(ConsultarVehiculosDto, {
      vehicleTypeId: 'f0836911-5b63-490c-88a2-9176b9b2b4a1',
      vehicleStatus: EstadoVehiculo.DISPONIBLE,
      plate: ' abc12 ',
      isActive: 'false',
      page: '2',
      limit: '15',
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.plate).toBe('ABC12');
    expect(dto.isActive).toBe(false);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(15);
  });

  it('rechaza valores inv?lidos', async () => {
    const dto = plainToInstance(ConsultarVehiculosDto, {
      vehicleTypeId: 'invalido',
      vehicleStatus: 'invalido',
      isActive: 'tal_vez',
      page: '0',
      limit: '101',
    });
    expect((await validate(dto)).length).toBeGreaterThanOrEqual(5);
  });
});
