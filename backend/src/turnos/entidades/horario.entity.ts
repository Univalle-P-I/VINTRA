import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'schedule' })
@Check('ck_schedule_time_range', '"end_time" > "start_time"')
export class Horario {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'schedule_pkey',
  })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  nombre: string | null;

  @Column({
    name: 'start_time',
    type: 'time',
  })
  horaInicio: string;

  @Column({
    name: 'end_time',
    type: 'time',
  })
  horaFin: string;

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
