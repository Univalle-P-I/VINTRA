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

import { DatosUsuario } from '../../usuarios/entidades/datos-usuario.entity';

@Entity({ name: 'email_validation_token' })
@Index('idx_email_validation_token_user_data_id', ['datosUsuario'])
@Index('idx_email_validation_token_expires_at', ['expiraEn'])
@Unique('uq_email_validation_token_hash', ['hashToken'])
@Check('ck_email_validation_token_expires_at', '"expires_at" > "created_at"')
export class TokenValidacionCorreo {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'email_validation_token_pkey',
  })
  id: string;

  @ManyToOne(() => DatosUsuario, { nullable: false })
  @JoinColumn({
    name: 'user_data_id',
    foreignKeyConstraintName: 'fk_email_validation_token_user_data',
  })
  datosUsuario: DatosUsuario;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 254,
  })
  correo: string;

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
