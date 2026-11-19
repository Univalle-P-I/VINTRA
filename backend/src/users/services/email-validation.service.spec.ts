import type { Repository } from 'typeorm';
import { EmailValidationService } from './email-validation.service';
import type { EmailValidationToken } from '../entities/email-validation-token.entity';

describe('EmailValidationService', () => {
  let service: EmailValidationService;

  beforeEach(() => {
    service = new EmailValidationService({} as Repository<EmailValidationToken>);
  });

  it('genera un token de 32 bytes codificado en hexadecimal', async () => {
    const token = await service.generateEmailToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('devuelve los resultados actuales de validación y hash del token', async () => {
    await expect(service.validateEmailToken('hash')).resolves.toBe(true);
    await expect(service.hashEmailToken('token')).resolves.toBe('');
    await expect(service.saveHashEmailToken()).resolves.toBeUndefined();
  });
});
