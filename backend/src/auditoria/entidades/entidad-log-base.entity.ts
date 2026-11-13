import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';
import { AccionAuditoria } from './audit-action.enum';

export abstract class EntidadLogBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
