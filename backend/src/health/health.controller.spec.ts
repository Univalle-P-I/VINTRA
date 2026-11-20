import { HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let dataSource: { query: jest.Mock };

  beforeEach(() => {
    dataSource = {
      query: jest.fn(),
    };

    healthController = new HealthController(
      dataSource as unknown as DataSource,
    );
  });

  describe('GET /health', () => {
    it('devuelve el estado de salud de la API', () => {
      expect(healthController.check()).toEqual({
        status: 'ok',
        service: 'vintra-backend',
      });
    });
  });

  describe('GET /health/db', () => {
    it('devuelve el estado de la base de datos cuando la consulta tiene éxito', async () => {
      const currentTime = new Date('2026-10-28T12:00:00.000Z');

      dataSource.query.mockResolvedValue([
        { current_time: currentTime },
      ]);

      await expect(healthController.checkDatabase()).resolves.toEqual({
        status: 'ok',
        database: 'connected',
        time: currentTime,
      });

      expect(dataSource.query).toHaveBeenCalledWith(
        'SELECT NOW() AS current_time',
      );
    });

    it('devuelve HTTP 500 cuando falla la consulta a la base de datos', async () => {
      dataSource.query.mockRejectedValue(
        new Error('Database connection failed'),
      );

      try {
        await healthController.checkDatabase();
        fail('Expected the database health check to throw an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect((error as HttpException).getResponse()).toEqual({
          status: 'error',
          database: 'disconnected',
        });
      }
    });
  });
});
