import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoVehiculo } from '../asignaciones.constants';

/**
 * Tabla `vehicle` (database/migrations/007_create_vehicle.sql).
 *
 * PROVISIONAL: mapeo mínimo para validar disponibilidad en #93. La gestión de
 * flota es de VIN-023 (#75); si esa entidad llega a develop, reemplazar esta.
 */
@Entity({ name: 'vehicle' })
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'vehicle_status',
    type: 'enum',
    enum: EstadoVehiculo,
    enumName: 'vehicle_status',
  })
  estado!: EstadoVehiculo;

  @Column({ name: 'plate', type: 'char', length: 6 })
  placa!: string;

  @Column({ name: 'is_active', type: 'boolean' })
  activo!: boolean;
}
