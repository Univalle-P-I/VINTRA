import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Crew } from '../../cuadrillas/entities/crew.entity';

/**
 * Conductor. Tabla `driver` (database/migrations/016_create_driver.sql).
 *
 * PROVISIONAL: alineada con la rama docs/documentacion-BD de la PR #115, que
 * todavía no está aprobada. Ajustar si el esquema cambia.
 */
@Entity({ name: 'driver' })
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // PROVISIONAL (#115, #125): FK a user_account. Se declara como relación
  // cuando exista la entidad UserAccount del módulo Usuarios y Perfiles (#125).
  @Column({ name: 'user_account_id', type: 'uuid' })
  userAccountId!: string;

  @Column({ name: 'crew_id', type: 'uuid', nullable: true })
  crewId!: string | null;

  // PROVISIONAL (#115): fk_driver_crew, ON DELETE CASCADE.
  @ManyToOne(() => Crew, (crew) => crew.drivers, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crew_id' })
  crew?: Relation<Crew> | null;

  @Column({
    name: 'started_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  startedAt!: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Los asigna la base de datos (DEFAULT now() y trigger de updated_at).
  @Column({ name: 'created_at', type: 'timestamptz', insert: false, update: false })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', insert: false, update: false })
  updatedAt!: Date;
}
