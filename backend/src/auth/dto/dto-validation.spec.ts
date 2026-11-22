import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ForgotPwdDto } from './forgot-pwd';
import { LoginDto } from './login.dto';
import { ResetPwdDto } from './reset-pwd.dto';
import { TokensDto } from './tokens.dto';

describe('DTOs de autenticación', () => {
  it('quita espacios del correo de recuperación y valida los campos obligatorios', () => {
    const dto = plainToInstance(ForgotPwdDto, { ipUser: '127.0.0.1', emailUser: '  a@example.com  ' });
    expect(dto.emailUser).toBe('a@example.com');
    expect(validateSync(dto)).toHaveLength(0);
    expect(validateSync(plainToInstance(ForgotPwdDto, { ipUser: '', emailUser: '' })).length).toBeGreaterThan(0);
  });

  it('normaliza el correo de inicio de sesión y rechaza datos malformados', () => {
    const dto = plainToInstance(LoginDto, { email: '  USER@EXAMPLE.COM ', password: 'pass' });
    expect(dto.email).toBe('user@example.com');
    expect(validateSync(dto)).toHaveLength(0);
    expect(validateSync(plainToInstance(LoginDto, { email: 'bad', password: '' })).length).toBeGreaterThan(0);
  });

  it('valida el token de restablecimiento y la nueva contraseña segura', () => {
    expect(validateSync(plainToInstance(ResetPwdDto, { token: 'token', newPassword: 'Strong1!' }))).toHaveLength(0);
    expect(validateSync(plainToInstance(ResetPwdDto, { token: '', newPassword: 'weak' })).length).toBeGreaterThan(0);
  });

  it('exige los tokens de acceso y de renovación', () => {
    expect(validateSync(plainToInstance(TokensDto, { refreshToken: 'refresh', accessToken: 'access' }))).toHaveLength(0);
    expect(validateSync(plainToInstance(TokensDto, { refreshToken: '', accessToken: '' })).length).toBeGreaterThan(0);
  });
});
