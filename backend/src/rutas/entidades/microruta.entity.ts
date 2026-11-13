import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Macroruta } from './macroruta.entity';
import { RutaLinealBase } from './ruta-lineal-base.entity';

@Entity({ name: 'microroute' })
@Index('idx_microroute_macroroute_id', ['macroruta'])
@Unique('uq_microroute_code', ['codigo'])
@Index('idx_microroute_geom', ['geometria'], { spatial: true })
export class Microruta extends RutaLinealBase {
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
}
