import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Driver } from '../../personal/entities/driver.entity';
import { EstadoAsignacion } from '../asignaciones.constants';
import { ProgramacionMicroruta } from './programacion-microruta.entity';
import { Vehiculo } from './vehiculo.entity';

/** Tabla `assignment` (database/migrations/017_create_assignment.sql). */
@Entity({ name: 'assignment' })
export class Asignacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'driver_id', type: 'uuid' })
  conductorId!: string;

  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'driver_id' })
  conductor?: Driver;

  @Column({ name: 'microroute_schedule_id', type: 'uuid' })
  programacionId!: string;

  @ManyToOne(() => ProgramacionMicroruta, { nullable: false })
  @JoinColumn({ name: 'microroute_schedule_id' })
  programacion?: ProgramacionMicroruta;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehiculoId!: string;

  @ManyToOne(() => Vehiculo, { nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehiculo?: Vehiculo;

  @Column({
    name: 'assignment_status',
    type: 'enum',
    enum: EstadoAsignacion,
    enumName: 'assignment_status',
  })
  estado!: EstadoAsignacion;

  @Column({ name: 'scheduled_start_at', type: 'timestamptz' })
  inicioProgramado!: Date;

  @Column({ name: 'scheduled_end_at', type: 'timestamptz' })
  finProgramado!: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  inicioReal!: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  finReal!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  activo!: boolean;

  // Los asigna la base de datos (DEFAULT now() y trigger de updated_at).
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    insert: false,
    update: false,
  })
  creadoEn!: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    insert: false,
    update: false,
  })
  actualizadoEn!: Date;
}
