import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Asignacion } from '../../asignaciones/entidades/asignacion.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('assignment_log')
export class AsignacionLog extends EntidadLogBase {
  @ManyToOne(() => Asignacion, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  asignacion: Asignacion;
}
