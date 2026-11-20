import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EstadoUsuario } from '../usuarios/entidades/cuenta-usuario.entity';
import { AuthenticatedUser } from './authenticated-user';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const userId = '98bfa4fd-360c-42d7-a027-c47e8fdb2e9b';

  function createContext(authorization?: string): {
    context: ExecutionContext;
    request: { headers: { authorization?: string }; user?: AuthenticatedUser };
  } {
    const request: {
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    } = { headers: { authorization } };

    return {
      context: {
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
      request,
    };
  }

  it('accepts a valid Bearer JWT and attaches its account id', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    };
    const sessionId = '820ba15b-fd9c-4690-97ae-3e2929674cd1';
    const sessionRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: sessionId,
        expiraEn: new Date(Date.now() + 60_000),
        cuentaUsuario: { id: userId },
      }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const accountRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: userId,
        estado: EstadoUsuario.ACTIVO,
        bloqueadoHasta: null,
      }),
    };
    const guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      sessionRepository as never,
      accountRepository as never,
    );
    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ userId, sessionId });
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(sessionRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          hashToken: expect.any(String),
        }),
      }),
    );
    expect(sessionRepository.update).toHaveBeenCalledWith(
      sessionId,
      expect.objectContaining({ ultimoUsoEn: expect.any(Date) }),
    );
  });

  it('rejects missing, invalid, expired, or malformed tokens', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('Invalid token')),
    };
    const guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      { findOne: jest.fn(), update: jest.fn() } as never,
      { findOne: jest.fn() } as never,
    );
    const missingToken = createContext();

    await expect(
      guard.canActivate(missingToken.context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    const invalidToken = createContext('Bearer invalid-token');
    await expect(
      guard.canActivate(invalidToken.context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    jwtService.verifyAsync.mockResolvedValue({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) - 1,
    });
    const expiredToken = createContext('Bearer expired-token');
    await expect(
      guard.canActivate(expiredToken.context),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'not-a-uuid',
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    const malformedToken = createContext('Bearer malformed-token');
    await expect(
      guard.canActivate(malformedToken.context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
