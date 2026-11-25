import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('inicio de la aplicación', () => {
  const originalPort = process.env.PORT;

  const mockApp = {
    useGlobalPipes: jest.fn(),
    enableCors: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  afterAll(() => {
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
  });

  it('configura ValidationPipe global, CORS y usa el puerto 3002 de forma predeterminada', async () => {
    delete process.env.PORT;

    await bootstrap();

    expect(NestFactory.create.mock.calls).toHaveLength(1);
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: 'http://localhost:5173',
    });
    expect(mockApp.listen.mock.calls).toEqual([[3002]]);
  });

  it('usa la variable de entorno PORT cuando está definida', async () => {
    process.env.PORT = '4000';

    await bootstrap();

    expect(mockApp.listen.mock.calls).toEqual([[4000]]);
  });

  it('rechaza un puerto no válido antes de empezar a escuchar', async () => {
    process.env.PORT = 'not-a-port';

    await expect(bootstrap()).rejects.toThrow(
      'PORT debe ser un número entero entre 1 y 65535',
    );

    expect(mockApp.listen.mock.calls).toHaveLength(0);
  });
});
