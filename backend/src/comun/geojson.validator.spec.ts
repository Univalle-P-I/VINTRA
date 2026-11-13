import { isGeoJsonGeometry } from './geojson.validator';

describe('isGeoJsonGeometry', () => {
  it('accepts geometry matching the PostgreSQL column type', () => {
    expect(
      isGeoJsonGeometry(
        { type: 'Point', coordinates: [-76.5, 3.4] },
        'Point',
      ),
    ).toBe(true);
    expect(
      isGeoJsonGeometry(
        {
          type: 'MultiLineString',
          coordinates: [
            [
              [-76.5, 3.4],
              [-76.4, 3.5],
            ],
          ],
        },
        'MultiLineString',
      ),
    ).toBe(true);
  });

  it('rejects a mismatched geometry type and non-finite or non-2D positions', () => {
    expect(
      isGeoJsonGeometry(
        { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
        'MultiLineString',
      ),
    ).toBe(false);
    expect(
      isGeoJsonGeometry(
        { type: 'Point', coordinates: [0, Number.NaN] },
        'Point',
      ),
    ).toBe(false);
    expect(
      isGeoJsonGeometry(
        { type: 'Point', coordinates: [0, 1, 2] },
        'Point',
      ),
    ).toBe(false);
  });
});
