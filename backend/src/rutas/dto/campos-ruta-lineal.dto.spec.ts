import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ActualizarMicrorutaDto } from './actualizar-microruta.dto';
import { CrearMacrorutaDto } from './crear-macroruta.dto';
import { CrearMicrorutaDto } from './crear-microruta.dto';

const VALID_GEOMETRY = {
  type: 'MultiLineString',
  coordinates: [
    [
      [-76.5, 3.4],
      [-76.4, 3.5],
    ],
  ],
};

describe('shared linear route DTO fields', () => {
  it('applies common transforms and geometry validation to both create DTOs', () => {
    const macroruta = plainToInstance(CrearMacrorutaDto, {
      code: ' R-1 ',
      name: ' Ruta principal ',
      geometry: VALID_GEOMETRY,
    });
    const microruta = plainToInstance(CrearMicrorutaDto, {
      macrorouteId: 'c0a80101-0000-4000-8000-000000000001',
      code: ' R-2 ',
      name: ' Ruta secundaria ',
      geometry: VALID_GEOMETRY,
    });

    expect(macroruta.code).toBe('R-1');
    expect(macroruta.name).toBe('Ruta principal');
    expect(validateSync(macroruta)).toEqual([]);
    expect(microruta.code).toBe('R-2');
    expect(microruta.name).toBe('Ruta secundaria');
    expect(validateSync(microruta)).toEqual([]);
  });

  it('keeps microroute updates partial while validating provided geometry', () => {
    const update = plainToInstance(ActualizarMicrorutaDto, {
      code: ' R-3 ',
    });
    const invalidUpdate = plainToInstance(ActualizarMicrorutaDto, {
      geometry: { type: 'Point', coordinates: [-76.5, 3.4] },
    });

    expect(update.code).toBe('R-3');
    expect(validateSync(update)).toEqual([]);
    expect(
      validateSync(invalidUpdate).map(({ property }) => property),
    ).toContain('geometry');
  });
});
