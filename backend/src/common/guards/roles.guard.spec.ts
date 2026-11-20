import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roles } from '../enums/roles.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const handler = jest.fn();
  const controller = jest.fn();
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  // Simula el contexto HTTP mínimo que consulta el guard.
  const contextFor = (user?: unknown) =>
    ({
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as never;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('permite una ruta que no exige roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextFor())).toBe(true);
  });

  it('rechaza el acceso si no hay un usuario autenticado', () => {
    reflector.getAllAndOverride.mockReturnValue([roles.ADMIN]);

    expect(() => guard.canActivate(contextFor())).toThrow(
      UnauthorizedException,
    );
  });

  it('permite al usuario que tiene el rol requerido', () => {
    reflector.getAllAndOverride.mockReturnValue([roles.OPERATOR]);

    expect(
      guard.canActivate(contextFor({ roles: [roles.OPERATOR] })),
    ).toBe(true);
  });

  it('rechaza al usuario que no tiene un rol requerido', () => {
    reflector.getAllAndOverride.mockReturnValue([roles.ADMIN]);

    expect(() =>
      guard.canActivate(contextFor({ roles: [roles.DRIVER] })),
    ).toThrow(ForbiddenException);
  });
});
