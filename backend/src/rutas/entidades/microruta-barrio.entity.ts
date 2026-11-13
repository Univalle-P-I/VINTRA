import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Barrio } from './barrio.entity';
import { Microruta } from './microruta.entity';

@Entity({ name: 'microroute_neighborhood' })
@Index('idx_microroute_neighborhood_microroute_id', ['microruta'])
@Index('idx_microroute_neighborhood_neighborhood_id', ['barrio'])
@Unique('uq_microroute_neighborhood', ['microruta', 'barrio'])
@Unique('uq_microroute_neighborhood_order', ['microruta', 'ordenVisita'])
@Check('ck_microroute_neighborhood_order_visit', '"order_visit" > 0')
export class MicrorutaBarrio {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'microroute_neighborhood_pkey',
  })
  id: string;

  @ManyToOne(() => Barrio, { nullable: false })
  @JoinColumn({
    name: 'neighborhood_id',
    foreignKeyConstraintName: 'fk_microroute_neighborhood_neighborhood',
  })
  barrio: Barrio;

  @ManyToOne(() => Microruta, { nullable: false })
  @JoinColumn({
    name: 'microroute_id',
    foreignKeyConstraintName: 'fk_microroute_neighborhood_microroute',
  })
  microruta: Microruta;

  @Column({
    name: 'order_visit',
    type: 'int',
  })
  ordenVisita: number;
}
