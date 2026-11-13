import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';
import { Vehiculo } from '../../vehiculos/entidades/vehiculo.entity';
import { AccionAuditoria } from './audit-action.enum';

@Entity('vehicle_log')
export class VehiculoLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehiculo, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  vehiculo: Vehiculo;

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