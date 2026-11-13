import { Column } from 'typeorm';

export abstract class RutaLinealBase {
  @Column({
    name: 'code',
    type: 'varchar',
    length: 30,
  })
  codigo: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 120,
  })
  nombre: string;

  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'MultiLineString',
    srid: 4326,
  })
  geometria: object;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  actualizadoEn: Date;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  creadoEn: Date;
}
