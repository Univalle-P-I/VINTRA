import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { CuentaUsuario } from './cuenta-usuario.entity';

@Entity({ name: 'user_data' })
@Unique('uq_user_data_email', ['correo'])
export class DatosUsuario {
  @PrimaryColumn({
    type: 'uuid',
    primaryKeyConstraintName: 'user_data_pkey',
  })
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 80 })
  nombres: string;

  @Column({ name: 'last_name', type: 'varchar', length: 80 })
  apellidos: string;

  @Column({ name: 'email', type: 'varchar', length: 254 })
  correo: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono: string | null;

  @Column({
    name: 'email_verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  correoVerificadoEn: Date | null;

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

  @OneToOne(() => CuentaUsuario, (cuentaUsuario) => cuentaUsuario.datosUsuario)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_data_user_account',
  })
  cuentaUsuario: CuentaUsuario;
}
