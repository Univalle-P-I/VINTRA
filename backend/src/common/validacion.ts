import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

interface DetalleValidacion {
  field: string;
  reason: string;
}

function obtenerDetalles(
  errores: ValidationError[],
  prefijo = '',
): DetalleValidacion[] {
  return errores.flatMap((error) => {
    const campo = prefijo ? `${prefijo}.${error.property}` : error.property;
    const detalles = Object.values(error.constraints ?? {}).map((reason) => ({
      field: campo,
      reason,
    }));

    return [...detalles, ...obtenerDetalles(error.children ?? [], campo)];
  });
}

export function crearValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errores) =>
      new BadRequestException({
        message: 'La solicitud contiene campos no válidos.',
        details: obtenerDetalles(errores),
      }),
  });
}
