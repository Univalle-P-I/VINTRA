import { BadRequestException, ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export function lanzarErrorDeCreacionRuta(
  error: unknown,
  mensajeCodigoDuplicado: string,
): never {
  if (error instanceof QueryFailedError) {
    const codigo = error.driverError.code;

    if (codigo === '23505') {
      throw new ConflictException(mensajeCodigoDuplicado);
    }

    if (['22023', 'XX000', '22P02'].includes(codigo)) {
      throw new BadRequestException('geom no es un GeoJSON válido.');
    }
  }

  throw error;
}
