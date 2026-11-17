import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailValidationToken } from './email-validation-token.entity.js';
import { PasswordResetToken } from './pwd-reset.entity.js';
import { Profile } from './profile.entity.js';
import { Session } from './session.entity.js';
import { userStatus } from '../../common/enums/user-status.enum.js';
import { documentType } from '../../common/enums/document-type.enum.js';

@Entity({ name: 'user_account' })
export class UserAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: userStatus, enumName: 'user_status', name: 'user_status' })
  userStatus: userStatus;

  @Column({ type: 'enum', enum: documentType, enumName: 'document_type', name: 'document_type' })
  documentType: documentType;

  @Column({ type: 'varchar', name: 'document_id' })
  documentId: string;

  @Column({ type: 'text', name: 'pwd_hash', select: false })
  pwdHash: string;

  @Column({ type: 'varchar', name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'smallint', default: 0, name: 'failed_attempts' })
  failedAttempts: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'locked_until' })
  lockedUntil: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'password_changed_at' })
  passwordChangedAt: Date | null;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Profile, (profile) => profile.userAccount)
  profiles: Profile[];

  @OneToMany(() => Session, (session) => session.userAccount)
  sessions: Session[];

  @OneToMany(() => PasswordResetToken, (token) => token.userAccount)
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => EmailValidationToken, (token) => token.userAccount)
  emailValidationTokens: EmailValidationToken[];

}
