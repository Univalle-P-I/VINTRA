import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const handler = jest.fn();
  const controller = jest.fn();
  const context = {
    getHandler: () => handler,
    getClass: () => controller,
  } as unknown as ExecutionContext;

  let reflector: { getAllAndOverride: jest.Mock };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new JwtAuthGuard(reflector as unknown as Reflector);
  });

  it('permite rutas públicas sin validar el token', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);
  });

  it('delega la validación de rutas privadas al guard de Passport', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const passportCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue('resultado de Passport');

    expect(guard.canActivate(context)).toBe('resultado de Passport');
    expect(passportCanActivate).toHaveBeenCalledWith(context);

    passportCanActivate.mockRestore();
  });
});
