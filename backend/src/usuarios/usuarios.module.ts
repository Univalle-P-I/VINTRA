
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaUsuario } from './entidades/cuenta-usuario.entity';
import { DatosUsuario } from './entidades/datos-usuario.entity';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CuentaUsuario, DatosUsuario]),
    AutenticacionModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService, TypeOrmModule],
})
export class UsuariosModule {}
