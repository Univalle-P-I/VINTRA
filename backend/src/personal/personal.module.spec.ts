import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { CrewMember } from './entities/crew-member.entity';
import { Driver } from './entities/driver.entity';
import { PersonalController } from './personal.controller';
import { PersonalModule } from './personal.module';
import { PersonalService } from './personal.service';

describe('PersonalModule', () => {
  it('carga el módulo y resuelve sus dependencias', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PersonalModule],
    })
      .overrideProvider(getRepositoryToken(Driver))
      .useValue({})
      .overrideProvider(getRepositoryToken(CrewMember))
      .useValue({})
      .compile();

    expect(moduleRef.get(PersonalService)).toBeInstanceOf(PersonalService);
    expect(moduleRef.get(PersonalController)).toBeInstanceOf(
      PersonalController,
    );
  });

  it('mapea las entidades a las tablas del esquema', () => {
    const tables = getMetadataArgsStorage().tables;
    const tableOf = (target: unknown) =>
      tables.find((table) => table.target === target)?.name;

    expect(tableOf(Driver)).toBe('driver');
    expect(tableOf(CrewMember)).toBe('crew_member');
  });
});
