import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';
import { Perfil } from '../../perfiles/entidades/perfil.entity';
import { AccionAuditoria } from './audit-action.enum';

@Entity('profile_log')
export class PerfilLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Perfil, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  perfil: Perfil;

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