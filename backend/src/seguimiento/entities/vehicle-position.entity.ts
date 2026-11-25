import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Posición geográfica de un vehículo. Tabla `vehicle_position`
 * (database/migrations/018_create_vehicle_position.sql).
 *
 * Alineada con la migración 018, integrada en develop con la PR #115.
 * El alcance del seguimiento sigue sujeto a las decisiones pendientes (#91).
 */
@Entity({ name: 'vehicle_position' })
export class VehiclePosition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // PROVISIONAL (#130): FK a assignment (fk_vehicle_position_assignment).
  // Se declara como relación cuando exista la entidad de Asignaciones
  // (#130) en develop.
  @Column({ name: 'assignment_id', type: 'uuid' })
  assignmentId!: string;

  // geometry(Point, 4326), WGS 84.
  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geom!: object;

  // Estado operativo. Por defecto TRUE en la base.
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt!: Date;

  // Lo asigna la base de datos (DEFAULT now()).
  @Column({
    name: 'created_at',
    type: 'timestamptz',
    insert: false,
    update: false,
  })
  createdAt!: Date;
}