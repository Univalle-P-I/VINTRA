import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrewMember } from './entities/crew-member.entity';
import { Driver } from './entities/driver.entity';
import { PersonalController } from './personal.controller';
import { PersonalService } from './personal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, CrewMember])],
  controllers: [PersonalController],
  providers: [PersonalService],
  // Cuadrillas depende del personal operativo.
  exports: [PersonalService, TypeOrmModule],
})
export class PersonalModule {}
