import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { Perfil } from '../perfiles/entidades/perfil.entity';
import { TipoVehiculo } from './entidades/tipo-vehiculo.entity';
import { Vehiculo } from './entidades/vehiculo.entity';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TipoVehiculo, Vehiculo, Perfil]),
    AutenticacionModule,
  ],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [VehiculosService, TypeOrmModule],
})
export class VehiculosModule {}