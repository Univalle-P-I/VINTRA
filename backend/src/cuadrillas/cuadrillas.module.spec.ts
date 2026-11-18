import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Personal } from '../personal/entities/personal.entity';
import { PersonalModule } from '../personal/personal.module';
import { PersonalService } from '../personal/personal.service';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasModule } from './cuadrillas.module';
import { CuadrillasService } from './cuadrillas.service';
import { Cuadrilla } from './entities/cuadrilla.entity';

describe('CuadrillasModule', () => {
  it('carga el módulo y resuelve su dependencia con Personal', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CuadrillasModule],
    })
      .overrideProvider(getRepositoryToken(Cuadrilla))
      .useValue({})
      .overrideProvider(getRepositoryToken(Personal))
      .useValue({})
      .compile();

    expect(moduleRef.get(CuadrillasService)).toBeInstanceOf(CuadrillasService);
    expect(moduleRef.get(CuadrillasController)).toBeInstanceOf(
      CuadrillasController,
    );
    expect(
      moduleRef.get(PersonalService, { strict: false }),
    ).toBeInstanceOf(PersonalService);
  });

  it('importa PersonalModule', () => {
    const imports = Reflect.getMetadata('imports', CuadrillasModule) as unknown[];
    expect(imports).toContain(PersonalModule);
  });
});
