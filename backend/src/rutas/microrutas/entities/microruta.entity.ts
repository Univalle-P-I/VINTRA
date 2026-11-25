import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Macroruta } from '../../macrorutas/entities/macroruta.entity';


@Entity({ name: 'microroute' })
export class Microruta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Macroruta, { nullable: false })
  @JoinColumn({ name: 'macroroute_id' })
  macroruta: Macroruta;

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
