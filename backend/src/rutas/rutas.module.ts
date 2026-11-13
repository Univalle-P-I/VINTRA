
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Macroruta } from './entidades/macroruta.entity';
import { Microruta } from './entidades/microruta.entity';
import { Barrio } from './entidades/barrio.entity';
import { MicrorutaBarrio } from './entidades/microruta-barrio.entity';
import { RutasController } from './rutas.controller';
import { RutasService } from './rutas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Macroruta, Microruta, Barrio, MicrorutaBarrio]),
    AutenticacionModule,
  ],
  controllers: [RutasController],
  providers: [RutasService],
  exports: [RutasService, TypeOrmModule],
})
export class RutasModule {}
