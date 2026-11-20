import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseToken } from './base-token.entity.js';
import { UserAccount } from './user-account.entity.js';

@Entity({ name: 'email_validation_token' })
@Index('IDX_email_validation_token_hash', ['tokenHash'], { unique: true })
export class EmailValidationToken extends BaseToken {
  @ManyToOne(
    () => UserAccount,
    (userAccount) => userAccount.emailValidationTokens,
    { nullable: false },
  )
  @JoinColumn({ name: 'user_account_id' })
  userAccount: UserAccount;

}
