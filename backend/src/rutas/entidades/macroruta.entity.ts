import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'macroroute' })
@Unique('uq_macroroute_code', ['codigo'])
@Index('idx_macroroute_geom', ['geometria'], { spatial: true })
export class Macroruta {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'macroroute_pkey',
  })
  id: string;

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
