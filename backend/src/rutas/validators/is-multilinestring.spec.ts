import { validate } from 'class-validator';
import { IsMultiLineString } from './is-multilinestring';

class GeometriaDto {
  @IsMultiLineString()
  geom: unknown;
}

describe('IsMultiLineString', () => {
  it('acepta un MultiLineString válido en lon/lat', async () => {
    const dto = new GeometriaDto();
    dto.geom = {
      type: 'MultiLineString',
      coordinates: [
        [
          [-76.53, 3.43],
          [-76.52, 3.44],
        ],
      ],
    };

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([
    [
      'tipo incorrecto',
      { type: 'Point', coordinates: [-76.53, 3.43] },
    ],
    [
      'línea con un punto',
      { type: 'MultiLineString', coordinates: [[[-76.53, 3.43]]] },
    ],
    [
      'latitud fuera de rango',
      {
        type: 'MultiLineString',
        coordinates: [
          [
            [-76.53, 91],
            [-76.52, 3.44],
          ],
        ],
      },
    ],
    [
      'coordenada no finita',
      {
        type: 'MultiLineString',
        coordinates: [
          [
            [Number.NaN, 3.43],
            [-76.52, 3.44],
          ],
        ],
      },
    ],
    ['arreglo vacío', { type: 'MultiLineString', coordinates: [] }],
  ])('rechaza %s', async (_caso, geom) => {
    const dto = new GeometriaDto();
    dto.geom = geom;

    const errores = await validate(dto);

    expect(errores).toHaveLength(1);
    expect(errores[0].constraints).toEqual({
      isMultiLineString:
        'geom debe ser un GeoJSON MultiLineString válido (lon/lat, SRID 4326)',
    });
  });
});
