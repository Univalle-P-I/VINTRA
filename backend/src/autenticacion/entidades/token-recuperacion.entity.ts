import {
  Column,
  Check,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';

@Entity({ name: 'password_reset_token' })
@Index('idx_password_reset_token_user_account_id', ['cuentaUsuario'])
@Index('idx_password_reset_token_expires_at', ['expiraEn'])
@Unique('uq_password_reset_token_hash', ['hashToken'])
@Check('ck_password_reset_token_expires_at', '"expires_at" > "created_at"')
export class TokenRecuperacion {
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

  @Column({
    name: 'token_hash',
    type: 'char',
    length: 64,
  })
  hashToken: string;

  @Column({
    name: 'request_ip',
    type: 'inet',
    nullable: true,
  })
  ipSolicitud: string | null;

  @Column({
    name: 'used_at',
    type: 'timestamptz',
    nullable: true,
  })
  utilizadoEn: Date | null;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiraEn: Date;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  creadoEn: Date;
}
