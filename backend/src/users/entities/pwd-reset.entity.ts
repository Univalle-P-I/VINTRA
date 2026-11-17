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

@Entity({ name: 'password_reset_token' })
@Index('IDX_password_reset_token_hash', ['tokenHash'], { unique: true })
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_account_id' })
  userAccountId: string;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.passwordResetTokens, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_account_id' })
  userAccount: UserAccount;

  @Column({ type: 'char', length: 64, name: 'token_hash', select: false })
  tokenHash: string;

  @Column({ type: 'inet', nullable: true, name: 'request_ip' })
  requestIp: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'used_at' })
  usedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
