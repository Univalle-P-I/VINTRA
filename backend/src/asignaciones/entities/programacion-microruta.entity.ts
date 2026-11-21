import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Microruta } from '../../rutas/microrutas/entities/microruta.entity';
import { Horario } from './horario.entity';

/**
 * Tabla `microroute_schedule`: una microruta en una franja y día de la semana.
 * Mapeo mínimo para #93 (la gestión completa es de VIN-027, #79).
 */
@Entity({ name: 'microroute_schedule' })
export class ProgramacionMicroruta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'microroute_id', type: 'uuid' })
  microrutaId!: string;

  @ManyToOne(() => Microruta, { nullable: false })
  @JoinColumn({ name: 'microroute_id' })
  microruta?: Microruta;

  @Column({ name: 'schedule_id', type: 'uuid' })
  horarioId!: string;

  @ManyToOne(() => Horario, { nullable: false })
  @JoinColumn({ name: 'schedule_id' })
  horario?: Horario;

  /** 1 = lunes … 7 = domingo (CHECK 1..7). */
  @Column({ name: 'day_of_week', type: 'smallint' })
  diaSemana!: number;

  @Column({ name: 'is_active', type: 'boolean' })
  activo!: boolean;
}
