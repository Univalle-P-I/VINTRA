import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Macroruta } from '../../rutas/entidades/macroruta.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('macroroute_log')
export class MacrorutaLog extends EntidadLogBase {
  @ManyToOne(() => Macroruta, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  macroruta: Macroruta;
}
