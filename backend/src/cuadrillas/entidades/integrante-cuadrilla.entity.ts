import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Cuadrilla } from './cuadrilla.entity';

@Entity({ name: 'crew_member' })
@Index('idx_crew_member_crew_id', ['cuadrilla'])
export class IntegranteCuadrilla {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'crew_member_pkey',
  })
  id: string;

  @ManyToOne(() => Cuadrilla, { nullable: true })
  @JoinColumn({
    name: 'crew_id',
    foreignKeyConstraintName: 'fk_crew_member_crew',
  })
  cuadrilla: Cuadrilla | null;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 120,
  })
  nombreCompleto: string;

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
