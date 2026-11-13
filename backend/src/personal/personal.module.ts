
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Conductor } from './entidades/conductor.entity';
import { Cuadrilla } from '../cuadrillas/entidades/cuadrilla.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PersonalController } from './personal.controller';
import { PersonalService } from './personal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conductor, Cuadrilla]),
    AutenticacionModule,
    UsuariosModule,
  ],
  controllers: [PersonalController],
  providers: [PersonalService],
  exports: [PersonalService, TypeOrmModule],
})
export class PersonalModule {}
