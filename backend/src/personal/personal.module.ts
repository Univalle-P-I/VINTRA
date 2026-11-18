import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalController } from './personal.controller';
import { PersonalService } from './personal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Personal])],
  controllers: [PersonalController],
  providers: [PersonalService],
  // Cuadrillas depende del personal operativo.
  exports: [PersonalService, TypeOrmModule],
})
export class PersonalModule {}
