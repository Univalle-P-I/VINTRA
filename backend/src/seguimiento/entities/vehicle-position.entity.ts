import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Posición geográfica de un vehículo. Tabla `vehicle_position`.
 *
 * PROVISIONAL: alineada con la PR #115, que todavía no está aprobada.
 * Ajustar si el esquema cambia.
 */
@Entity({ name: 'vehicle_position' })
export class VehiclePosition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // PROVISIONAL (#115, #130): FK a assignment. Se declara como relación
  // cuando exista la entidad de Asignaciones (#130) en develop.
  @Column({ name: 'assignment_id', type: 'uuid' })
  assignmentId!: string;

  // PROVISIONAL (#115): geometry(Point, 4326), WGS 84.
  @Column({
    name: 'geom',
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geom!: object;

  // PROVISIONAL (#115): estado operativo. Por defecto TRUE en la base.
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