import { Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { RutaLinealBase } from './ruta-lineal-base.entity';

@Entity({ name: 'macroroute' })
@Unique('uq_macroroute_code', ['codigo'])
@Index('idx_macroroute_geom', ['geometria'], { spatial: true })
export class Macroruta extends RutaLinealBase {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'macroroute_pkey',
  })
  id: string;
}
