import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { ComunModule } from './comun/comun.module';
import { CuadrillasModule } from './cuadrillas/cuadrillas.module';
import { PerfilesModule } from './perfiles/perfiles.module';
import { PersonalModule } from './personal/personal.module';
import { RutasModule } from './rutas/rutas.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';

export function createDatabaseOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: Number(config.get<string>('DB_PORT', '5432')),
    username: config.get<string>('POSTGRES_USER'),
    password: config.get<string>('POSTGRES_PASSWORD'),
    database: config.get<string>('POSTGRES_DB'),
    autoLoadEntities: true,
    synchronize: false,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createDatabaseOptions,
    }),
    ComunModule,
    AutenticacionModule,
    PerfilesModule,
    PersonalModule,
    CuadrillasModule,
    RutasModule,
    VehiculosModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
