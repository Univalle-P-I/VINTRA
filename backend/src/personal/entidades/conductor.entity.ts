import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DatosUsuario } from '../../usuarios/entidades/datos-usuario.entity';
import { Cuadrilla } from '../../cuadrillas/entidades/cuadrilla.entity';

@Entity({ name: 'driver' })
@Index('idx_driver_user_data_id', ['datosUsuario'])
@Index('idx_driver_crew_id', ['cuadrilla'])
@Check('ck_driver_dates', '"ended_at" IS NULL OR "ended_at" >= "started_at"')
export class Conductor {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'driver_pkey',
  })
  id: string;

  @ManyToOne(() => DatosUsuario, { nullable: false })
  @JoinColumn({
    name: 'user_data_id',
    foreignKeyConstraintName: 'fk_driver_user_data',
  })
  datosUsuario: DatosUsuario;

  @ManyToOne(() => Cuadrilla, { nullable: true })
  @JoinColumn({
    name: 'crew_id',
    foreignKeyConstraintName: 'fk_driver_crew',
  })
  cuadrilla: Cuadrilla | null;

  @Column({
    name: 'started_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  inicioVinculacion: Date;

  @Column({
    name: 'ended_at',
    type: 'timestamptz',
    nullable: true,
  })
  finVinculacion: Date | null;

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
