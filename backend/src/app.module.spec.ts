
import { ConfigService } from '@nestjs/config';
import { createDatabaseOptions } from './app.module';

describe('createDatabaseOptions', () => {
  it('usa la configuración de PostgreSQL de ConfigService', () => {
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

  it('usa localhost y el puerto 5432 cuando hacen falta valores predeterminados', () => {
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
