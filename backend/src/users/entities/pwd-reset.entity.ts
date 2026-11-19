import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseToken } from './base-token.entity.js';
import { UserAccount } from './user-account.entity.js';

@Entity({ name: 'password_reset_token' })
@Index('IDX_password_reset_token_hash', ['tokenHash'], { unique: true })
export class PasswordResetToken extends BaseToken {
  @ManyToOne(() => UserAccount, (userAccount) => userAccount.passwordResetTokens, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_account_id' })
  userAccount: UserAccount;

}
