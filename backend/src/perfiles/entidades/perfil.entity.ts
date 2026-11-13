import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  ValueTransformer,
} from 'typeorm';

import { CuentaUsuario } from '../../usuarios/entidades/cuenta-usuario.entity';

export enum RolUsuario {
  ADMIN = 'admin',
  OPERATIONS_MANAGER = 'operations_manager',
  DRIVER = 'driver',
}

const rolTransformer: ValueTransformer = {
  to: (value: RolUsuario) =>
    ({
      [RolUsuario.ADMIN]: 'ADMIN',
      [RolUsuario.OPERATIONS_MANAGER]: 'OP',
      [RolUsuario.DRIVER]: 'DRIVER',
    })[value],
  from: (value: string) =>
    ({
      ADMIN: RolUsuario.ADMIN,
      OP: RolUsuario.OPERATIONS_MANAGER,
      DRIVER: RolUsuario.DRIVER,
    })[value],
};

@Entity({ name: 'profile' })
@Index('idx_profile_user_account_id', ['cuentaUsuario'])
@Unique('uq_profile_account_role', ['cuentaUsuario', 'rol'])
export class Perfil {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'profile_pkey',
  })
  id: string;

  @ManyToOne(() => CuentaUsuario, { nullable: false })
  @JoinColumn({
    name: 'user_account_id',
    foreignKeyConstraintName: 'fk_profile_user_account',
  })
  cuentaUsuario: CuentaUsuario;

  @Column({
    name: 'user_role',
    type: 'enum',
    enum: ['ADMIN', 'OP', 'DRIVER'],
    enumName: 'user_role',
    transformer: rolTransformer,
  })
  rol: RolUsuario;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  activo: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  creadoEn: Date;
}
