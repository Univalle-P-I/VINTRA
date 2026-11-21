import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('inicio de la aplicación', () => {
  const originalPort = process.env.PORT;

  const mockApp = {
    enableCors: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
    setGlobalPrefix: jest.fn(),
    useGlobalPipes: jest.fn(),
    useGlobalFilters: jest.fn(),
  };
  let swaggerSetup: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    jest
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({
        openapi: '3.0.0',
        info: { title: 'API VINTRA', version: '0.0.1' },
        paths: {},
      });
    swaggerSetup = jest
      .spyOn(SwaggerModule, 'setup')
      .mockImplementation(() => undefined);
  });

  afterAll(() => {
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
  });

  it('configura CORS y usa el puerto 3002 de forma predeterminada', async () => {
    delete process.env.PORT;

    await bootstrap();

    expect(NestFactory.create.mock.calls).toHaveLength(1);
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: 'http://localhost:5173',
    });
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api/v1', {
      exclude: ['health', 'health/db'],
    });
    expect(mockApp.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(mockApp.useGlobalFilters).toHaveBeenCalledTimes(1);
    expect(swaggerSetup).toHaveBeenCalledWith(
      'api/docs',
      mockApp,
      expect.any(Object),
    );
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
