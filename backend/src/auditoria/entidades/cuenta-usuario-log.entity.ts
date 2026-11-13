import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';
import { EntidadLogBase } from './entidad-log-base.entity';

@Entity('user_account_log')
export class CuentaUsuarioLog extends EntidadLogBase {
  @ManyToOne(() => CuentaUsuario, { nullable: false })
  @JoinColumn({ name: 'entity_id' })
  cuentaUsuario: CuentaUsuario;
}
