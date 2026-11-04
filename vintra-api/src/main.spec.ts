

import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('bootstrap', () => {
  const originalPort = process.env.PORT;

  const mockApp = {
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

  it('configures CORS and uses port 3002 by default', async () => {
    delete process.env.PORT;

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: 'http://localhost:5173',
    });
    expect(mockApp.listen).toHaveBeenCalledWith(3002);
  });

  it('uses the PORT environment variable when defined', async () => {
    process.env.PORT = '4000';

    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith('4000');
  });
});
