import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'crew' })
export class Cuadrilla {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'crew_pkey',
  })
  id: string;

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
