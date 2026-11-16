import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordHasherService {

  private readonly options = {
    type: argon2.argon2id,
    memoryCost: 19456, 
    timeCost: 2,
    parallelism: 1,
  } as const;

  async hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword, this.options);
  }

  async verify(storedHash: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(storedHash, plainPassword);
    } catch {

      return false;
    }
  }

  needsRehash(storedHash: string): boolean {
    return argon2.needsRehash(storedHash, this.options);
  }
}