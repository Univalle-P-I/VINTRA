import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FiltroExcepciones } from './filtro-excepciones';

describe('FiltroExcepciones', () => {
  const filtro = new FiltroExcepciones();

  function crearContexto(requestId?: unknown) {
    const request = { headers: { 'x-request-id': requestId } };
    const respuesta = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => respuesta,
      }),
    } as unknown as ArgumentsHost;

    return { host, respuesta };
  }

  it('responde con detalles de validación y conserva un requestId válido', () => {
    const { host, respuesta } = crearContexto('req-123.test');
    const excepcion = new BadRequestException({
      message: 'Datos inválidos.',
      details: [
        { field: 'nombre', reason: 'Es obligatorio.' },
        { field: 'ignorado' },
        null,
      ],
    });

    filtro.catch(excepcion, host);

    expect(respuesta.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(respuesta.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos.',
      details: [{ field: 'nombre', reason: 'Es obligatorio.' }],
      requestId: 'req-123.test',
    });
  });

  it.each([
    [new UnauthorizedException(), HttpStatus.UNAUTHORIZED, 'AUTHENTICATION_REQUIRED'],
    [new ForbiddenException(), HttpStatus.FORBIDDEN, 'FORBIDDEN'],
    [new NotFoundException(), HttpStatus.NOT_FOUND, 'NOT_FOUND'],
    [new ConflictException(), HttpStatus.CONFLICT, 'CONFLICT'],
  ])('mapea las excepciones HTTP conocidas', (excepcion, estado, codigo) => {
    const { host, respuesta } = crearContexto();

    filtro.catch(excepcion, host);

    expect(respuesta.status).toHaveBeenCalledWith(estado);
    expect(respuesta.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: estado, code: codigo, details: [] }),
    );
    expect(respuesta.json.mock.calls[0][0].requestId).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
  });

  it('usa el mensaje de texto de la respuesta HTTP y el código interno desconocido', () => {
    const { host, respuesta } = crearContexto('x'.repeat(129));
    const excepcion = new HttpException('No procesable.', HttpStatus.UNPROCESSABLE_ENTITY);

    filtro.catch(excepcion, host);

    expect(respuesta.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(respuesta.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INTERNAL_ERROR',
        message: 'No procesable.',
        details: [],
      }),
    );
    expect(respuesta.json.mock.calls[0][0].requestId).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
  });

  it('normaliza errores no controlados sin exponer sus mensajes', () => {
    const { host, respuesta } = crearContexto(42);

    filtro.catch(new Error('secreto'), host);

    expect(respuesta.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(respuesta.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor.',
        details: [],
      }),
    );
    expect(respuesta.json.mock.calls[0][0].requestId).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
  });

  it('usa mensaje genérico si una excepción no trae un mensaje de texto', () => {
    const { host, respuesta } = crearContexto('');

    filtro.catch(
      new HttpException({ message: ['mensaje inválido'], details: {} }, 418),
      host,
    );

    expect(respuesta.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INTERNAL_ERROR',
        message: 'La solicitud no pudo ser procesada.',
        details: [],
      }),
    );
  });
});
