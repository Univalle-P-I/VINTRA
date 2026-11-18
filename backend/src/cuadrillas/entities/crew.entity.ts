import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CrewMember } from '../../personal/entities/crew-member.entity';
import { Driver } from '../../personal/entities/driver.entity';

/**
 * Cuadrilla. Tabla `crew` (database/migrations/014_create_crew.sql).
 *
 * PROVISIONAL: alineada con la rama docs/documentacion-BD de la PR #115, que
 * todavía no está aprobada. Ajustar si el esquema cambia.
 */
@Entity({ name: 'crew' })
export class Crew {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // PROVISIONAL (#115): la FK vive en crew_member.crew_id y driver.crew_id.
  // La composición de cuadrillas (asignar/quitar miembros) se implementa en
  // VIN-024 (#76).
  @OneToMany(() => CrewMember, (member) => member.crew)
  members?: Relation<CrewMember[]>;

  @OneToMany(() => Driver, (driver) => driver.crew)
  drivers?: Relation<Driver[]>;

  // Los asigna la base de datos (DEFAULT now() y trigger de updated_at).
  @Column({ name: 'created_at', type: 'timestamptz', insert: false, update: false })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', insert: false, update: false })
  updatedAt!: Date;
}
