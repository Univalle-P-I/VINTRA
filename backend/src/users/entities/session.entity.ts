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

@Entity({ name: 'session' })

export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_account_id' })
  userAccountId: string;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.sessions, {
    nullable: false})
  @JoinColumn({ name: 'user_account_id' })
  userAccount: UserAccount;

  @Column({ type: 'char', length: 64, name: 'token_hash', select: false })
  tokenHash: string;

  @Column({ type: 'inet', nullable: true, name: 'request_ip' })
  requestIp: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'revoked_at' })
  revokedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_used_at' })
  lastUsedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
