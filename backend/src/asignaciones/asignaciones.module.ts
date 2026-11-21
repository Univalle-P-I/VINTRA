import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { Asignacion } from './entities/asignacion.entity';
import { Horario } from './entities/horario.entity';
import { ProgramacionMicroruta } from './entities/programacion-microruta.entity';
import { Vehiculo } from './entities/vehiculo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asignacion,
      Horario,
      ProgramacionMicroruta,
      Vehiculo,
    ]),
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
