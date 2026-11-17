import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from './user-account.entity.js';
import { roles } from '../../common/enums/roles.enum.js';

@Entity({ name: 'profile' })
@Index('UQ_profile_user_account_role', ['userAccountId', 'userRole'], {
  unique: true,
})
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_account_id' })
  userAccountId: string;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.profiles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_account_id' })
  userAccount: UserAccount;

  @Column({ type: 'enum', enum: roles, enumName: 'user_role', name: 'user_role' })
  userRole: roles;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
