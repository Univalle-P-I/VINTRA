
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfil } from './entidades/perfil.entity';
import { CuentaUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { PerfilesController } from './perfiles.controller';
import { PerfilesService } from './perfiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Perfil, CuentaUsuario]),
    AutenticacionModule,
  ],
  controllers: [PerfilesController],
  providers: [PerfilesService],
  exports: [PerfilesService, TypeOrmModule],
})
export class PerfilesModule {}
