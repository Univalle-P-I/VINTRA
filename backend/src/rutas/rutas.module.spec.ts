import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
import { RutasModule } from './rutas.module';

describe('RutasModule', () => {
  it('resuelve controladores y servicios sin conectarse a la base de datos', async () => {
    const repositorio = { find: jest.fn(), findOne: jest.fn() };

    const builder = Test.createTestingModule({ imports: [RutasModule] });
    for (const entidad of [Macroruta, Microruta, Barrio, MicrorutaBarrio]) {
      builder
        .overrideProvider(getRepositoryToken(entidad))
        .useValue(repositorio);
    }

    const moduleRef = await builder.compile();

    expect(moduleRef.get(MacrorutasController)).toBeInstanceOf(
      MacrorutasController,
    );
    expect(moduleRef.get(MicrorutasController)).toBeInstanceOf(
      MicrorutasController,
    );
    expect(moduleRef.get(BarriosController)).toBeInstanceOf(BarriosController);
    expect(moduleRef.get(MacrorutasService)).toBeInstanceOf(MacrorutasService);
    expect(moduleRef.get(MicrorutasService)).toBeInstanceOf(MicrorutasService);
    expect(moduleRef.get(BarriosService)).toBeInstanceOf(BarriosService);

    await moduleRef.close();
  });
});
