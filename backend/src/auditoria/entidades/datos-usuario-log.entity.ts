import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { DatosUsuario } from '../../usuarios/entidades/datos-usuario.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('user_data_log')
export class DatosUsuarioLog extends EntidadLogBase {
  @ManyToOne(() => DatosUsuario, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  datosUsuario: DatosUsuario;
}
