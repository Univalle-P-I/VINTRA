import { ValidatorConstraint } from 'class-validator';
import type {
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export type GeometryTipo = 'MultiLineString' | 'MultiPolygon' | 'Point';

@ValidatorConstraint({ name: 'geoJsonGeometry', async: false })
export class GeoJsonGeometryValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const type = args.constraints[0];
    return (
      (type === 'MultiLineString' ||
        type === 'MultiPolygon' ||
        type === 'Point') &&
      isGeoJsonGeometry(value, type)
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `geometry debe ser un GeoJSON ${args.constraints[0]} con posiciones 2D.`;
  }
}

export function isGeoJsonGeometry(
  value: unknown,
  type: GeometryTipo,
): boolean {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('type' in value) ||
    !('coordinates' in value) ||
    value.type !== type
  ) {
    return false;
  }

  const coordinates = value.coordinates;
  const isPosition = (position: unknown): boolean =>
    Array.isArray(position) &&
    position.length === 2 &&
    position.every(
      (coordinate) =>
        typeof coordinate === 'number' && Number.isFinite(coordinate),
    );

  if (type === 'Point') return isPosition(coordinates);
  if (!Array.isArray(coordinates)) return false;
  if (type === 'MultiLineString') {
    return coordinates.every(
      (line) => Array.isArray(line) && line.every(isPosition),
    );
  }
  return coordinates.every(
    (polygon) =>
      Array.isArray(polygon) &&
      polygon.every(
        (ring) => Array.isArray(ring) && ring.every(isPosition),
      ),
  );
}
