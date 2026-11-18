import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalController } from './personal.controller';
import { PersonalModule } from './personal.module';
import { PersonalService } from './personal.service';

describe('PersonalModule', () => {
  it('carga el módulo y resuelve sus dependencias', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PersonalModule],
    })
      .overrideProvider(getRepositoryToken(Personal))
      .useValue({})
      .compile();

    expect(moduleRef.get(PersonalService)).toBeInstanceOf(PersonalService);
    expect(moduleRef.get(PersonalController)).toBeInstanceOf(
      PersonalController,
    );
  });
});
