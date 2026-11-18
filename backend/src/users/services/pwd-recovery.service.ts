import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/pwd-reset.entity';
import { PasswordHasherService } from '../../common/security/password-hasher.service';

@Injectable()
export class PwdRecoveryService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly pwdResetTokenRepo: Repository<PasswordResetToken>,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async consume(token: string, newPassword: string): Promise<void> {
  }

  generateToken(): string {
    throw new Error('Method not implemented.');
  }

  hashToken(token: string): string {
    throw new Error('Method not implemented.');
  }
}
