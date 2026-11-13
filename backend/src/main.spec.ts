import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { bootstrap, getCorsOrigins } from './main';
import { setupSwagger } from './swagger';

jest.mock('./swagger', () => ({
  setupSwagger: jest.fn(),
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('bootstrap', () => {
  const originalPort = process.env.PORT;
  const originalCorsOrigin = process.env.CORS_ORIGIN;

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

    if (originalCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = originalCorsOrigin;
    }
  });

  it('configures CORS and uses port 3002 by default', async () => {
    delete process.env.PORT;
    delete process.env.CORS_ORIGIN;

    await bootstrap();

    expect(NestFactory.create.mock.calls).toHaveLength(1);
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173'],
    });
    expect(setupSwagger).toHaveBeenCalledWith(mockApp);
    expect(mockApp.listen.mock.calls).toEqual([[3002]]);
  });

  it('allows the configured comma-separated frontend origins', async () => {
    process.env.CORS_ORIGIN =
      'http://localhost:5173, http://localhost:5174';

    await bootstrap();

    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173', 'http://localhost:5174'],
    });
  });

  it('uses the PORT environment variable when defined', async () => {
    process.env.PORT = '4000';

    await bootstrap();

    expect(mockApp.listen.mock.calls).toEqual([[4000]]);
  });

  it('rejects an invalid port before listening', async () => {
    process.env.PORT = 'not-a-port';

    await expect(bootstrap()).rejects.toThrow(
      'PORT debe ser un número entero entre 1 y 65535',
    );

    expect(mockApp.listen.mock.calls).toHaveLength(0);
  });

  it('falls back to the development origin when the configured list is empty', () => {
    expect(getCorsOrigins(' , ')).toEqual(['http://localhost:5173']);
  });
});
