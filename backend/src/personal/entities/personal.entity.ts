import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PROVISIONAL: columnas y nombres tomados como referencia mientras la PR #115
 * (DER y diccionario de datos) no esté aprobada. Ajustar al esquema definitivo.
 */
@Entity({ name: 'personal' })
export class Personal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 150 })
  nombreCompleto!: string;

  @Column({ type: 'varchar', length: 50 })
  cargo!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  // PROVISIONAL (#115): la relación con Usuarios/Perfiles (#125) se define
  // cuando exista su estructura y el esquema esté aprobado.

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;
}
