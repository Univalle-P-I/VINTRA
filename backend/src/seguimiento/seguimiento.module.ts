import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclePosition } from './entities/vehicle-position.entity';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoService } from './seguimiento.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehiclePosition])],
  controllers: [SeguimientoController],
  providers: [SeguimientoService],
  // Asignaciones (#130) y los recursos operativos se integrarán después.
  exports: [SeguimientoService, TypeOrmModule],
})
export class SeguimientoModule {}