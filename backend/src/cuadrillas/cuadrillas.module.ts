import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalModule } from '../personal/personal.module';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasService } from './cuadrillas.service';
import { Cuadrilla } from './entities/cuadrilla.entity';

@Module({
  imports: [PersonalModule, TypeOrmModule.forFeature([Cuadrilla])],
  controllers: [CuadrillasController],
  providers: [CuadrillasService],
  exports: [CuadrillasService],
})
export class CuadrillasModule {}
