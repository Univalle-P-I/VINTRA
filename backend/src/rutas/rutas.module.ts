import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarriosController } from './barrios/barrios.controller';
import { BarriosService } from './barrios/barrios.service';
import { Barrio } from './barrios/entities/barrios.entity';
import { Macroruta } from './macrorutas/entities/macroruta.entity';
import { MacrorutasController } from './macrorutas/macrorutas.controller';
import { MacrorutasService } from './macrorutas/macrorutas.service';
import { MicrorutaBarrio } from './microrutas/entities/microruta-barrio.entity';
import { Microruta } from './microrutas/entities/microruta.entity';
import { MicrorutasController } from './microrutas/microrutas.controller';
import { MicrorutasService } from './microrutas/microrutas.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Macroruta, Microruta, Barrio, MicrorutaBarrio]),
  ],
  controllers: [
    MacrorutasController,
    MicrorutasController,
    BarriosController,
  ],
  providers: [MacrorutasService, MicrorutasService, BarriosService],
  exports: [MacrorutasService, MicrorutasService, BarriosService],
})
export class RutasModule {}
