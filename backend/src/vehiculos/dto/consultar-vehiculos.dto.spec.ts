import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { EstadoVehiculo } from '../entidades/vehiculo.entity';
import { ConsultarVehiculosDto } from './consultar-vehiculos.dto';

async function validar(datos: Record<string, unknown>) {
  const dto = plainToInstance(ConsultarVehiculosDto, datos);
  const errores = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return { dto, propiedadesInvalidas: errores.map((error) => error.property) };
}

describe('ConsultarVehiculosDto', () => {
  it('acepta una consulta sin filtros', async () => {
    const { propiedadesInvalidas } = await validar({});

    expect(propiedadesInvalidas).toEqual([]);
  });

  it('convierte los textos de la URL a sus tipos reales', async () => {
    const { dto, propiedadesInvalidas } = await validar({
      vehicleTypeId: '00000000-0000-4000-8000-000000000001',
      vehicleStatus: 'maintenance',
      plate: ' abc123 ',
      isActive: 'false',
      page: '2',
      limit: '10',
    });

    expect(propiedadesInvalidas).toEqual([]);
    expect(dto.vehicleStatus).toBe(EstadoVehiculo.MANTENIMIENTO);
    expect(dto.plate).toBe('ABC123');
    expect(dto.isActive).toBe(false);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it('rechaza una placa que no tiene 6 caracteres', async () => {
    const { propiedadesInvalidas } = await validar({ plate: 'ABC12' });

    expect(propiedadesInvalidas).toContain('plate');
  });

  it('rechaza un estado que no existe', async () => {
    const { propiedadesInvalidas } = await validar({
      vehicleStatus: 'roto',
    });

    expect(propiedadesInvalidas).toContain('vehicleStatus');
  });

  it('rechaza un tipo de vehículo que no es UUID', async () => {
    const { propiedadesInvalidas } = await validar({
      vehicleTypeId: '123',
    });

    expect(propiedadesInvalidas).toContain('vehicleTypeId');
  });

  it('rechaza isActive cuando no es true ni false', async () => {
    const { propiedadesInvalidas } = await validar({ isActive: 'quizas' });

    expect(propiedadesInvalidas).toContain('isActive');
  });

  it('rechaza page y limit menores que 1 o no numéricos', async () => {
    const { propiedadesInvalidas } = await validar({
      page: '0',
      limit: 'abc',
    });

    expect(propiedadesInvalidas).toEqual(
      expect.arrayContaining(['page', 'limit']),
    );
  });

  it('rechaza parámetros que no están definidos en el DTO', async () => {
    const { propiedadesInvalidas } = await validar({ color: 'rojo' });

    expect(propiedadesInvalidas).toContain('color');
  });
});
