import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Sesion } from './entidades/sesion.entity';
import { TokenRecuperacion } from './entidades/token-recuperacion.entity';
import { TokenValidacionCorreo } from './entidades/token-validacion-correo.entity';
import { CuentaUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { DatosUsuario } from '../usuarios/entidades/datos-usuario.entity';
import { Perfil } from '../perfiles/entidades/perfil.entity';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { createJwtOptions } from './jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CuentaUsuario,
      DatosUsuario,
      Sesion,
      TokenRecuperacion,
      TokenValidacionCorreo,
      Perfil,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createJwtOptions,
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, JwtAuthGuard, RolesGuard],
  exports: [TypeOrmModule, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AutenticacionModule {}
