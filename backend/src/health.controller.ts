import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'vintra-backend',
    };
  }

  @Get('db')
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
      throw new HttpException(
        {
          status: 'error',
          database: 'disconnected',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}