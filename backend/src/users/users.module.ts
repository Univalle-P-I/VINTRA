import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { SessionService } from './services/session.service';
import { PwdRecoveryService } from './services/pwd-recovery.service';
import { PasswordHasherService } from '../common/security/password-hasher.service';
import { UserAccount } from './entities/user-account.entity';
import { Session } from './entities/session.entity';
import { PasswordResetToken } from './entities/pwd-reset.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { EmailValidationToken } from './entities/email-validation-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
  UserAccount,
  Profile,
  Session,
  PasswordResetToken,
  EmailValidationToken,
]),
  ],
  controllers: [UsersController],
  providers: [UserService, SessionService, PwdRecoveryService, PasswordHasherService],
  exports: [UserService, SessionService, PwdRecoveryService],
})
export class UsersModule {}
