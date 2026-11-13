import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'btura_neighborhood' })
@Index('idx_btura_neighborhood_name', ['nombre'], { unique: true })
@Index('idx_btura_neighborhood_geom', ['geometria'], { spatial: true })
export class Barrio {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'btura_neighborhood_pkey',
  })
  id: string;

  @Column({
    name: 'commune',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  comuna: string | null;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 120,
  })
  nombre: string;

  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
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
