
import { ConfigService } from '@nestjs/config';
import { createDatabaseOptions } from './app.module';

describe('createDatabaseOptions', () => {
  it('uses PostgreSQL configuration from ConfigService', () => {
    const values: Record<string, string> = {
      DB_HOST: 'postgres',
      DB_PORT: '5432',
      POSTGRES_USER: 'vintra_user',
      POSTGRES_PASSWORD: 'test_password',
      POSTGRES_DB: 'vintra',
    };

    const config = {
      get: jest.fn((key: string, defaultValue?: string) =>
        values[key] ?? defaultValue,
      ),
    } as unknown as ConfigService;

    expect(createDatabaseOptions(config)).toEqual({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'vintra_user',
      password: 'test_password',
      database: 'vintra',
      autoLoadEntities: true,
      synchronize: false,
    });
  });

  it('uses localhost and port 5432 when defaults are needed', () => {
    const config = {
      get: jest.fn((_key: string, defaultValue?: string) => defaultValue),
    } as unknown as ConfigService;

    const options = createDatabaseOptions(config);

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      autoLoadEntities: true,
      synchronize: false,
    });
  });
});
