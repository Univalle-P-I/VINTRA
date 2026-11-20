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
import { TokenBase } from './token-base.entity';

@Entity({ name: 'email_validation_token' })
@Index('idx_email_validation_token_user_data_id', ['datosUsuario'])
@Index('idx_email_validation_token_expires_at', ['expiraEn'])
@Unique('uq_email_validation_token_hash', ['hashToken'])
@Check('ck_email_validation_token_expires_at', '"expires_at" > "created_at"')
export class TokenValidacionCorreo extends TokenBase {
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
}
