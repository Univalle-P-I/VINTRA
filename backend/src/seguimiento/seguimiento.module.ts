
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { PosicionVehiculo } from './entidades/posicion-vehiculo.entity';
import { Asignacion } from '../asignaciones/entidades/asignacion.entity';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoService } from './seguimiento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PosicionVehiculo, Asignacion]),
    AutenticacionModule,
  ],
  controllers: [SeguimientoController],
  providers: [SeguimientoService],
  exports: [SeguimientoService, TypeOrmModule],
})
export class SeguimientoModule {}
