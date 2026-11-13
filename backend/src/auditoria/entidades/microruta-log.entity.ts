import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Microruta } from '../../rutas/entidades/microruta.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('microroute_log')
export class MicrorutaLog extends EntidadLogBase {
  @ManyToOne(() => Microruta, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  microruta: Microruta;
}
