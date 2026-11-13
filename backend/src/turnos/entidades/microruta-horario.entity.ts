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

import { Microruta } from '../../rutas/entidades/microruta.entity';
import { Horario } from './horario.entity';

@Entity({ name: 'microroute_schedule' })
@Index('idx_microroute_schedule_microroute_id', ['microruta'])
@Index('idx_microroute_schedule_schedule_id', ['horario'])
@Unique('uq_microroute_schedule', ['microruta', 'horario', 'diaSemana'])
@Check('ck_microroute_schedule_day_of_week', '"day_of_week" BETWEEN 1 AND 7')
export class MicrorutaHorario {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'microroute_schedule_pkey',
  })
  id: string;

  @ManyToOne(() => Microruta, { nullable: false })
  @JoinColumn({
    name: 'microroute_id',
    foreignKeyConstraintName: 'fk_microroute_schedule_microroute',
  })
  microruta: Microruta;

  @ManyToOne(() => Horario, { nullable: false })
  @JoinColumn({
    name: 'schedule_id',
    foreignKeyConstraintName: 'fk_microroute_schedule_schedule',
  })
  horario: Horario;

  @Column({
    name: 'day_of_week',
    type: 'smallint',
  })
  diaSemana: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  activo: boolean;

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
