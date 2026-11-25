import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const MENSAJE =
  'geom debe ser un GeoJSON MultiLineString válido (lon/lat, SRID 4326)';

function esMultiLineString(valor: unknown): boolean {
  if (
    typeof valor !== 'object' ||
    valor === null ||
    !('type' in valor) ||
    valor.type !== 'MultiLineString' ||
    !('coordinates' in valor) ||
    !Array.isArray(valor.coordinates) ||
    valor.coordinates.length === 0
  ) {
    return false;
  }

  return valor.coordinates.every(
    (linea: unknown) =>
      Array.isArray(linea) &&
      linea.length >= 2 &&
      linea.every(
        (punto: unknown) =>
          Array.isArray(punto) &&
          punto.length >= 2 &&
          punto.every(
            (coordenada: unknown) =>
              typeof coordenada === 'number' && Number.isFinite(coordenada),
          ) &&
          punto[0] >= -180 &&
          punto[0] <= 180 &&
          punto[1] >= -90 &&
          punto[1] <= 90,
      ),
  );
}

export function IsMultiLineString(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isMultiLineString',
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: {
        message: MENSAJE,
        ...validationOptions,
      },
      validator: {
        validate: esMultiLineString,
      },
    });
  };
}
