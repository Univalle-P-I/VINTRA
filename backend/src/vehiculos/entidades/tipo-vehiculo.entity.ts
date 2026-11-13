import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'vehicle_type' })
@Unique('uq_vehicle_type_code', ['codigo'])
export class TipoVehiculo {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'vehicle_type_pkey',
  })
  id: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 30,
  })
  codigo: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  activo: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  creadoEn: Date;
}
