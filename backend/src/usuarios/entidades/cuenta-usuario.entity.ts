import {
  Check,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  ValueTransformer,
} from 'typeorm';
import { DatosUsuario } from './datos-usuario.entity';

export enum EstadoUsuario {
  ACTIVO = 'active',
  INACTIVO = 'inactive',
  BLOQUEADO = 'locked',
  PENDIENTE_VERIFICACION = 'pending_verification',
}

export enum TipoDocumento {
  CC = 'CC',
}

const estadoTransformer: ValueTransformer = {
  to: (value: EstadoUsuario) =>
    ({
      [EstadoUsuario.ACTIVO]: 'ACTIVE',
      [EstadoUsuario.INACTIVO]: 'INACTIVE',
      [EstadoUsuario.BLOQUEADO]: 'LOCKED',
      [EstadoUsuario.PENDIENTE_VERIFICACION]: 'PENDING_VERIFICATION',
    })[value],
  from: (value: string) =>
    ({
      ACTIVE: EstadoUsuario.ACTIVO,
      INACTIVE: EstadoUsuario.INACTIVO,
      LOCKED: EstadoUsuario.BLOQUEADO,
      PENDING_VERIFICATION: EstadoUsuario.PENDIENTE_VERIFICACION,
    })[value],
};

@Entity({ name: 'user_account' })
@Unique('uq_user_account_document', ['tipoDocumento', 'numeroDocumento'])
@Check('ck_user_account_failed_attempts', '"failed_attempts" >= 0')
export class CuentaUsuario {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'user_account_pkey',
  })
  id: string;

  @Column({
    name: 'user_status',
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING_VERIFICATION'],
    enumName: 'user_status_enum',
    transformer: estadoTransformer,
  })
  estado: EstadoUsuario;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: ['CC'],
    enumName: 'document_type_enum',
  })
  tipoDocumento: TipoDocumento;

  @Column({
    name: 'document_id',
    type: 'char',
    length: 20,
  })
  numeroDocumento: string;

  @Column({ name: 'pwd_hash', type: 'text' })
  hashContrasena: string;

  @Column({ name: 'failed_attempts', type: 'smallint', default: 0 })
  intentosFallidos: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  bloqueadoHasta: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  ultimoInicioSesion: Date | null;

  @Column({
    name: 'password_changed_at',
    type: 'timestamptz',
    nullable: true,
  })
  contrasenaActualizadaEn: Date | null;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  actualizadoEn: Date;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  creadoEn: Date;

  @OneToOne(() => DatosUsuario, (datosUsuario) => datosUsuario.cuentaUsuario)
  datosUsuario: DatosUsuario;
}
