import { Injectable } from '@nestjs/common';
import { PasswordHasherService } from '../../common/security/password-hasher.service';

@Injectable()
export class PwdRecoveryService {
  constructor(private readonly passwordHasher: PasswordHasherService) {}

  async consume(token: string, newPassword: string): Promise<void> {
  }

  generateToken(): string {
    throw new Error('Method not implemented.');
  }

  hashToken(token: string): string {
    throw new Error('Method not implemented.');
  }
}
