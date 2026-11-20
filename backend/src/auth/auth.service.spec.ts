import { AuthService } from './auth.service';
import type { UserService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService({} as UserService);
  });

  it('expone las operaciones actuales de autenticación', async () => {
    await expect(service.authenticate({} as never)).resolves.toBeUndefined();
    await expect(service.revokeCurrentSession('session-1')).resolves.toBeUndefined();
    await expect(service.forgotPassword({} as never)).resolves.toBeUndefined();
    await expect(service.resetPassword({} as never)).resolves.toBeUndefined();
  });
});
