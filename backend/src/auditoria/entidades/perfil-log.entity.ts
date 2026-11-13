import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Perfil } from '../../perfiles/entidades/perfil.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('profile_log')
export class PerfilLog extends EntidadLogBase {
  @ManyToOne(() => Perfil, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  perfil: Perfil;
}
