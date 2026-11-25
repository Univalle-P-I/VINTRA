import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity({ name: 'macroroute' })
export class Macroruta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 120 })
  nombre: string;

  @Column({ name: 'code', type: 'varchar', length: 30, unique: true })
  codigo: string;

  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'MultiLineString',
    srid: 4326,
    select: false,
  })
  geom?: unknown;

  @Column({ name: 'is_active', type: 'boolean' })
  activo: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  actualizadoEn: Date;

  @Column({ name: 'created_at', type: 'timestamptz' })
  creadoEn: Date;
}
