import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { CrewMember } from '../personal/entities/crew-member.entity';
import { Driver } from '../personal/entities/driver.entity';
import { PersonalModule } from '../personal/personal.module';
import { PersonalService } from '../personal/personal.service';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasModule } from './cuadrillas.module';
import { CuadrillasService } from './cuadrillas.service';
import { Crew } from './entities/crew.entity';

describe('CuadrillasModule', () => {
  it('carga el módulo y resuelve su dependencia con Personal', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CuadrillasModule],
    })
      .overrideProvider(getRepositoryToken(Crew))
      .useValue({})
      .overrideProvider(getRepositoryToken(Driver))
      .useValue({})
      .overrideProvider(getRepositoryToken(CrewMember))
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

  it('mapea la entidad a la tabla del esquema', () => {
    const tables = getMetadataArgsStorage().tables;
    expect(tables.find((table) => table.target === Crew)?.name).toBe('crew');
  });
});
