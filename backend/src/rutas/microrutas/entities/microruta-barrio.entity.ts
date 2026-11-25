import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Barrio } from '../../barrios/entities/barrios.entity';
import { Microruta } from './microruta.entity';

@Unique('uq_microroute_neighborhood', ['microruta', 'barrio'])
@Entity({ name: 'microroute_neighborhood' })
export class MicrorutaBarrio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Barrio, { nullable: false })
  @JoinColumn({ name: 'neighborhood_id' })
  barrio: Barrio;

  @ManyToOne(() => Microruta, { nullable: false })
  @JoinColumn({ name: 'microroute_id' })
  microruta: Microruta;

  @Column({ name: 'order_visit', type: 'int' })
  ordenVisita: number;
}
