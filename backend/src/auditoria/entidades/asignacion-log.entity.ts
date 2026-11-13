import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';
import { Asignacion } from '../../asignaciones/entidades/asignacion.entity';
import { AccionAuditoria } from './audit-action.enum';

@Entity('assignment_log')
export class AsignacionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asignacion, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  asignacion: Asignacion;

  @ManyToOne(() => CuentaUsuario, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: CuentaUsuario | null;

  @Column({
    name: 'action',
    type: 'enum',
    enum: AccionAuditoria,
    enumName: 'audit_action',
  })
  accion: AccionAuditoria;

  @Column({ name: 'old', type: 'jsonb', nullable: true })
  valoresAnteriores: Record<string, unknown> | null;

  @Column({ name: 'new', type: 'jsonb', nullable: true })
  valoresNuevos: Record<string, unknown> | null;

  @Column({ name: 'request_ip', type: 'inet', nullable: true })
  ipSolicitud: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaCreacion: Date;
}