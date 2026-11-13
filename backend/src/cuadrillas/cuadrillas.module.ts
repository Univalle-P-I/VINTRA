
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Cuadrilla } from './entidades/cuadrilla.entity';
import { IntegranteCuadrilla } from './entidades/integrante-cuadrilla.entity';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasService } from './cuadrillas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cuadrilla, IntegranteCuadrilla]),
    AutenticacionModule,
  ],
  controllers: [CuadrillasController],
  providers: [CuadrillasService],
  exports: [CuadrillasService, TypeOrmModule],
})
export class CuadrillasModule {}
