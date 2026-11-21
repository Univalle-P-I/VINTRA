import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';

interface DetalleError {
  field: string;
  reason: string;
}

const CODIGOS_POR_ESTADO: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'AUTHENTICATION_REQUIRED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function obtenerDetalles(valor: unknown): DetalleError[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(
    (detalle): detalle is DetalleError =>
      esObjeto(detalle) &&
      typeof detalle.field === 'string' &&
      typeof detalle.reason === 'string',
  );
}

function obtenerRequestId(request: Request): string {
  const requestId = request.headers['x-request-id'];

  if (
    typeof requestId === 'string' &&
    /^[A-Za-z0-9._-]{1,128}$/.test(requestId)
  ) {
    return requestId;
  }

  return randomUUID();
}

@Catch()
export class FiltroExcepciones implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepciones.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const request = contexto.getRequest<Request>();
    const response = contexto.getResponse<Response>();
    const statusCode =
      excepcion instanceof HttpException
        ? excepcion.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const codigo =
      CODIGOS_POR_ESTADO[statusCode] ?? 'INTERNAL_ERROR';
    const requestId = obtenerRequestId(request);
    const cuerpo =
      excepcion instanceof HttpException
        ? excepcion.getResponse()
        : undefined;
    if (
      !(excepcion instanceof HttpException) ||
      (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR && statusCode < 600)
    ) {
      const mensajeError =
        excepcion instanceof Error ? excepcion.message : String(excepcion);
      const stack = excepcion instanceof Error ? excepcion.stack : undefined;
      this.logger.error(
        `[${requestId}] ${mensajeError}`,
        stack,
      );
    }
    const datos = esObjeto(cuerpo) ? cuerpo : undefined;
    const mensaje =
      statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Error interno del servidor.'
        : typeof datos?.message === 'string'
          ? datos.message
          : typeof cuerpo === 'string'
            ? cuerpo
            : 'La solicitud no pudo ser procesada.';

    response.status(statusCode).json({
      statusCode,
      code: codigo,
      message: mensaje,
      details: obtenerDetalles(datos?.details),
      requestId,
    });
  }
}
