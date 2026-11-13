
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Conductor } from '../personal/entidades/conductor.entity';
import { Asignacion } from './entidades/asignacion.entity';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asignacion, Conductor]),
    AutenticacionModule,
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService, TypeOrmModule],
})
export class AsignacionesModule {}
