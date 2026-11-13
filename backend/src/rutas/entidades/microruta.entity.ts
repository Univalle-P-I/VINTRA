import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Macroruta } from './macroruta.entity';

@Entity({ name: 'microroute' })
@Index('idx_microroute_macroroute_id', ['macroruta'])
@Unique('uq_microroute_code', ['codigo'])
@Index('idx_microroute_geom', ['geometria'], { spatial: true })
export class Microruta {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'microroute_pkey',
  })
  id: string;

  @ManyToOne(() => Macroruta, { nullable: false })
  @JoinColumn({
    name: 'macroroute_id',
    foreignKeyConstraintName: 'fk_microroute_macroroute',
  })
  macroruta: Macroruta;

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
