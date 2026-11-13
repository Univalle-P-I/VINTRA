
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Horario } from './entidades/horario.entity';
import { MicrorutaHorario } from './entidades/microruta-horario.entity';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Horario, MicrorutaHorario]),
    AutenticacionModule,
  ],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService, TypeOrmModule],
})
export class TurnosModule {}
