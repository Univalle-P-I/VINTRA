import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Cuadrilla } from '../../cuadrillas/entidades/cuadrilla.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('crew_log')
export class CuadrillaLog extends EntidadLogBase {
  @ManyToOne(() => Cuadrilla, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  cuadrilla: Cuadrilla;
}
