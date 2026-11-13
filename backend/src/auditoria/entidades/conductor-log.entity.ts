import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Conductor } from '../../personal/entidades/conductor.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('driver_log')
export class ConductorLog extends EntidadLogBase {
  @ManyToOne(() => Conductor, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  conductor: Conductor;
}
