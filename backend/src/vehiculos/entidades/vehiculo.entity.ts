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

import { TipoVehiculo } from './tipo-vehiculo.entity';

export enum EstadoVehiculo {
  DISPONIBLE = 'available',
  EN_SERVICIO = 'in_service',
  MANTENIMIENTO = 'maintenance',
  FUERA_DE_SERVICIO = 'out_of_service',
}

const estadoVehiculoTransformer: ValueTransformer = {
  to: (value: EstadoVehiculo) =>
    ({
      [EstadoVehiculo.DISPONIBLE]: 'AVAILABLE',
      [EstadoVehiculo.EN_SERVICIO]: 'IN_USE',
      [EstadoVehiculo.MANTENIMIENTO]: 'MAINTENANCE',
      [EstadoVehiculo.FUERA_DE_SERVICIO]: 'OUT_OF_SERVICE',
    })[value],
  from: (value: string) =>
    ({
      AVAILABLE: EstadoVehiculo.DISPONIBLE,
      IN_USE: EstadoVehiculo.EN_SERVICIO,
      MAINTENANCE: EstadoVehiculo.MANTENIMIENTO,
      OUT_OF_SERVICE: EstadoVehiculo.FUERA_DE_SERVICIO,
    })[value],
};

@Entity({ name: 'vehicle' })
@Index('idx_vehicle_vehicle_type_id', ['tipoVehiculo'])
@Unique('uq_vehicle_plate', ['placa'])
@Check('ck_vehicle_capacity_kg', '"capacity_kg" >= 0')
@Check('ck_vehicle_capacity_yd3', '"capacity_yd3" >= 0')
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'vehicle_pkey',
  })
  id: string;

  @ManyToOne(() => TipoVehiculo, { nullable: false })
  @JoinColumn({
    name: 'vehicle_type_id',
    foreignKeyConstraintName: 'fk_vehicle_vehicle_type',
  })
  tipoVehiculo: TipoVehiculo;

  @Column({
    name: 'vehicle_status',
    type: 'enum',
    enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'],
    enumName: 'vehicle_status',
    transformer: estadoVehiculoTransformer,
  })
  estado: EstadoVehiculo;

  @Column({
    name: 'plate',
    type: 'char',
    length: 6,
  })
  placa: string;

  @Column({
    name: 'capacity_kg',
    type: 'numeric',
  })
  capacidadKg: string;

  @Column({
    name: 'capacity_yd3',
    type: 'numeric',
  })
  capacidadYd3: string;

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
