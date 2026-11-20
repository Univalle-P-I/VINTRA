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
 * Miembro de cuadrilla (personal operativo). Tabla `crew_member`
 * (database/migrations/015_create_crew_member.sql).
 *
 * PROVISIONAL: alineada con la rama docs/documentacion-BD de la PR #115, que
 * todavía no está aprobada. Ajustar si el esquema cambia.
 */
@Entity({ name: 'crew_member' })
export class CrewMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'crew_id', type: 'uuid', nullable: true })
  crewId!: string | null;

  // PROVISIONAL (#115): fk_crew_member_crew, ON DELETE CASCADE.
  @ManyToOne(() => Crew, (crew) => crew.members, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crew_id' })
  crew?: Relation<Crew> | null;

  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Los asigna la base de datos (DEFAULT now() y trigger de updated_at).
  @Column({ name: 'created_at', type: 'timestamptz', insert: false, update: false })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', insert: false, update: false })
  updatedAt!: Date;
}
