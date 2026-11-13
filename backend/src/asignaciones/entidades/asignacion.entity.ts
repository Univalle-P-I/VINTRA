import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  ValueTransformer,
} from 'typeorm';

import { Conductor } from '../../personal/entidades/conductor.entity';
import { MicrorutaHorario } from '../../turnos/entidades/microruta-horario.entity';
import { Vehiculo } from '../../vehiculos/entidades/vehiculo.entity';

export enum EstadoAsignacion {
  PROGRAMADA = 'scheduled',
  EN_PROGRESO = 'in_progress',
  COMPLETADA = 'completed',
  CANCELADA = 'cancelled',
}

const estadoAsignacionTransformer: ValueTransformer = {
  to: (value: EstadoAsignacion) =>
    ({
      [EstadoAsignacion.PROGRAMADA]: 'SCHEDULED',
      [EstadoAsignacion.EN_PROGRESO]: 'IN_PROGRESS',
      [EstadoAsignacion.COMPLETADA]: 'COMPLETED',
      [EstadoAsignacion.CANCELADA]: 'CANCELLED',
    })[value],
  from: (value: string) =>
    ({
      SCHEDULED: EstadoAsignacion.PROGRAMADA,
      IN_PROGRESS: EstadoAsignacion.EN_PROGRESO,
      COMPLETED: EstadoAsignacion.COMPLETADA,
      CANCELLED: EstadoAsignacion.CANCELADA,
    })[value],
};

@Entity({ name: 'assignment' })
@Index('idx_assignment_driver_id', ['conductor'])
@Index('idx_assignment_microroute_schedule_id', ['microrutaHorario'])
@Index('idx_assignment_vehicle_id', ['vehiculo'])
@Index('idx_assignment_scheduled_start_at', ['inicioProgramado'])
@Unique('uq_assignment_schedule_start', [
  'microrutaHorario',
  'inicioProgramado',
])
@Check(
  'ck_assignment_scheduled_range',
  '"scheduled_end_at" >= "scheduled_start_at"',
)
@Check(
  'ck_assignment_actual_range',
  '"ended_at" IS NULL OR ("started_at" IS NOT NULL AND "ended_at" >= "started_at")',
)
export class Asignacion {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'assignment_pkey',
  })
  id: string;

  @ManyToOne(() => Conductor, { nullable: false })
  @JoinColumn({
    name: 'driver_id',
    foreignKeyConstraintName: 'fk_assignment_driver',
  })
  conductor: Conductor;

  @ManyToOne(() => MicrorutaHorario, { nullable: false })
  @JoinColumn({
    name: 'microroute_schedule_id',
    foreignKeyConstraintName: 'fk_assignment_microroute_schedule',
  })
  microrutaHorario: MicrorutaHorario;

  @ManyToOne(() => Vehiculo, { nullable: false })
  @JoinColumn({
    name: 'vehicle_id',
    foreignKeyConstraintName: 'fk_assignment_vehicle',
  })
  vehiculo: Vehiculo;

  @Column({
    name: 'assignment_status',
    type: 'enum',
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    enumName: 'assignment_status',
    transformer: estadoAsignacionTransformer,
  })
  estado: EstadoAsignacion;

  @Column({
    name: 'scheduled_start_at',
    type: 'timestamptz',
  })
  inicioProgramado: Date;

  @Column({
    name: 'scheduled_end_at',
    type: 'timestamptz',
  })
  finProgramado: Date;

  @Column({
    name: 'started_at',
    type: 'timestamptz',
    nullable: true,
  })
  iniciadoEn: Date | null;

  @Column({
    name: 'ended_at',
    type: 'timestamptz',
    nullable: true,
  })
  finalizadoEn: Date | null;

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
