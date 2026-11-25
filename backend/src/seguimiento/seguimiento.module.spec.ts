import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { VehiclePosition } from './entities/vehicle-position.entity';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoModule } from './seguimiento.module';
import { SeguimientoService } from './seguimiento.service';

describe('SeguimientoModule', () => {
  it('carga el módulo y resuelve sus dependencias', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SeguimientoModule],
    })
      .overrideProvider(getRepositoryToken(VehiclePosition))
      .useValue({})
      .compile();

    expect(moduleRef.get(SeguimientoService)).toBeInstanceOf(
      SeguimientoService,
    );
    expect(moduleRef.get(SeguimientoController)).toBeInstanceOf(
      SeguimientoController,
    );
  });

  it('mapea la entidad a la tabla del esquema', () => {
    const tables = getMetadataArgsStorage().tables;
    const tableOf = (target: unknown) =>
      tables.find((table) => table.target === target)?.name;

    expect(tableOf(VehiclePosition)).toBe('vehicle_position');
  });

  it('declara la geometría como Point con SRID 4326', () => {
    const column = getMetadataArgsStorage().columns.find(
      (col) =>
        col.target === VehiclePosition && col.propertyName === 'geom',
    );

    expect(column?.options.spatialFeatureType).toBe('Point');
    expect(column?.options.srid).toBe(4326);
  });
});