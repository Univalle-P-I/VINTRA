import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { ApiEndpoint } from '../comun/swagger.decorator';

@Controller('health')
@ApiTags('Salud')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiEndpoint({
    summary: 'Comprobar disponibilidad de la API',
    responseDescription: 'El proceso de la API está disponible.',
    responseSchema: {
      type: 'object',
      required: ['status', 'service'],
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'vintra-backend' },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      service: 'vintra-backend',
    };
  }

  @Get('db')
  @ApiEndpoint({
    summary: 'Comprobar conexión con PostgreSQL',
    responseDescription: 'La consulta de salud a PostgreSQL fue exitosa.',
    responseSchema: {
      type: 'object',
      required: ['status', 'database', 'time'],
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'connected' },
        time: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'PostgreSQL no está disponible.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        database: { type: 'string', example: 'disconnected' },
      },
    },
  })
  async checkDatabase() {
    try {
      const rows: Array<{ current_time: Date | string }> =
        await this.dataSource.query('SELECT NOW() AS current_time');

      return {
        status: 'ok',
        database: 'connected',
        time: rows[0].current_time,
      };
    } catch {
      this.logger.warn('PostgreSQL health check failed');
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
      });
    }
  }
}