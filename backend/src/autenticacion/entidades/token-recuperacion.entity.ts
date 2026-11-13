import {
  Check,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';
import { TokenBase } from './token-base.entity';

@Entity({ name: 'password_reset_token' })
@Index('idx_password_reset_token_user_account_id', ['cuentaUsuario'])
@Index('idx_password_reset_token_expires_at', ['expiraEn'])
@Unique('uq_password_reset_token_hash', ['hashToken'])
@Check('ck_password_reset_token_expires_at', '"expires_at" > "created_at"')
export class TokenRecuperacion extends TokenBase {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'password_reset_token_pkey',
  })
  id: string;

  @ManyToOne(() => CuentaUsuario, { nullable: false })
  @JoinColumn({
    name: 'user_account_id',
    foreignKeyConstraintName: 'fk_password_reset_token_user_account',
  })
  cuentaUsuario: CuentaUsuario;
}
