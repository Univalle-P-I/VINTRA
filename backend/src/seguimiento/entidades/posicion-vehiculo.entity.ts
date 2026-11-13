import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Asignacion } from '../../asignaciones/entidades/asignacion.entity';

@Entity({ name: 'vehicle_position' })
@Index('idx_vehicle_position_assignment_recorded', [
  'asignacion',
  'registradoEn',
])
@Index('idx_vehicle_position_geom', ['geometria'], { spatial: true })
export class PosicionVehiculo {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'vehicle_position_pkey',
  })
  id: string;

  @ManyToOne(() => Asignacion, { nullable: false })
  @JoinColumn({
    name: 'assignment_id',
    foreignKeyConstraintName: 'fk_vehicle_position_assignment',
  })
  asignacion: Asignacion;

  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geometria: object;

  @Column({
    name: 'recorded_at',
    type: 'timestamptz',
  })
  registradoEn: Date;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  creadoEn: Date;
}
