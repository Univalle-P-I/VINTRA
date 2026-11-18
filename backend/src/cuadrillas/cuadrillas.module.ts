import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalModule } from '../personal/personal.module';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasService } from './cuadrillas.service';
import { Crew } from './entities/crew.entity';

@Module({
  imports: [PersonalModule, TypeOrmModule.forFeature([Crew])],
  controllers: [CuadrillasController],
  providers: [CuadrillasService],
  exports: [CuadrillasService],
})
export class CuadrillasModule {}
