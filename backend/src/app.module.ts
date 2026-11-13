
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SaludModule } from './salud/salud.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PerfilesModule } from './perfiles/perfiles.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { PersonalModule } from './personal/personal.module';
import { CuadrillasModule } from './cuadrillas/cuadrillas.module';
import { TurnosModule } from './turnos/turnos.module';
import { RutasModule } from './rutas/rutas.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { SeguimientoModule } from './seguimiento/seguimiento.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ComunModule } from './comun/comun.module';

export function createDatabaseOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  const port = Number(config.get<string>('DB_PORT', '5432'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT debe ser un número entero entre 1 y 65535');
  }

  const requiredConfig = (key: string): string => {
    const value = config.get<string>(key);
    if (!value?.trim()) {
      throw new Error(`${key} es obligatorio para conectar con PostgreSQL`);
    }
    return value;
  };

  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port,
    username: requiredConfig('POSTGRES_USER'),
    password: requiredConfig('POSTGRES_PASSWORD'),
    database: requiredConfig('POSTGRES_DB'),
    autoLoadEntities: true,
    uuidExtension: 'pgcrypto',
    installExtensions: false,
    synchronize: false,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createDatabaseOptions,
    }),
    SaludModule,
    AutenticacionModule,
    UsuariosModule,
    PerfilesModule,
    VehiculosModule,
    PersonalModule,
    CuadrillasModule,
    TurnosModule,
    RutasModule,
    AsignacionesModule,
    SeguimientoModule,
    AuditoriaModule,
    ComunModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
