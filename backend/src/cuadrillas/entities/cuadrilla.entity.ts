import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Personal } from '../../personal/entities/personal.entity';

/**
 * PROVISIONAL: columnas y relaciones tomadas como referencia mientras la PR #115
 * (DER y diccionario de datos) no esté aprobada. Ajustar al esquema definitivo.
 */
@Entity({ name: 'cuadrillas' })
export class Cuadrilla {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  // PROVISIONAL (#115): relación con el personal operativo. La composición de
  // cuadrillas (asignar/quitar miembros) se implementa en VIN-024 (#76).
  @ManyToMany(() => Personal)
  @JoinTable({ name: 'cuadrillas_personal' })
  miembros?: Personal[];

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;
}
