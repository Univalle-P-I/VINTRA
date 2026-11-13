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

@Entity({ name: 'session' })
@Index('idx_session_user_account_id', ['cuentaUsuario'])
@Index('idx_session_expires_at', ['expiraEn'])
@Unique('uq_session_token_hash', ['hashToken'])
@Check('ck_session_expires_at', '"expires_at" > "created_at"')
export class Sesion {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'session_pkey',
  })
  id: string;

  @ManyToOne(() => CuentaUsuario, { nullable: false })
  @JoinColumn({
    name: 'user_account_id',
    foreignKeyConstraintName: 'fk_session_user_account',
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
  })
  ipSolicitud: string;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revocadoEn: Date | null;

  @Column({
    name: 'last_used_at',
    type: 'timestamptz',
    nullable: true,
  })
  ultimoUsoEn: Date | null;

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
