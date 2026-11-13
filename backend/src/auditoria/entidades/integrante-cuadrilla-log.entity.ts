import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { IntegranteCuadrilla } from '../../cuadrillas/entidades/integrante-cuadrilla.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('crew_member_log')
export class IntegranteCuadrillaLog extends EntidadLogBase {
  @ManyToOne(() => IntegranteCuadrilla, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  integranteCuadrilla: IntegranteCuadrilla;
}
