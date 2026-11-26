import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profiles/profile.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CuadrillasModule } from './cuadrillas/cuadrillas.module';
import { PersonalModule } from './personal/personal.module';
import { RutasModule } from './rutas/rutas.module';
import { UsersModule } from './users/users.module';
import { SeguimientoModule } from './seguimiento/seguimiento.module';
import { ThrottlerModule} from '@nestjs/throttler';

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
    
    AuthModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    UsersModule,
    ProfileModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createDatabaseOptions,
    }),
    PersonalModule,
    CuadrillasModule,
    RutasModule,
    SeguimientoModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
