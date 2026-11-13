
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TipoVehiculo } from './entidades/tipo-vehiculo.entity';
import { Vehiculo } from './entidades/vehiculo.entity';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TipoVehiculo,
      Vehiculo,
    ]),
    AutenticacionModule,
  ],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [VehiculosService, TypeOrmModule],
})
export class VehiculosModule {}
