import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { roles } from '../../common/enums/roles.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {

  // La estrategia solo necesita leer el secreto para estas pruebas unitarias.
  const config = {
    get: jest.fn().mockReturnValue('x'.repeat(32)),
  } as unknown as ConfigService;

  it('convierte los datos válidos del token en un usuario autenticado', () => {
    const strategy = new JwtStrategy(config);

    expect(
      strategy.validate({
        sub: 'usuario-1',
        email: 'usuario@ejemplo.com',
        roles: [roles.ADMIN],
        sid: 'sesion-1',
      }),
    ).toEqual({
      id: 'usuario-1',
      email: 'usuario@ejemplo.com',
      roles: [roles.ADMIN],
      sid: 'sesion-1',
    });
  });

  it('rechaza un token sin identificador de usuario', () => {
    const strategy = new JwtStrategy(config);

    expect(() => strategy.validate({} as never)).toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza roles que la aplicación no reconoce', () => {
    const strategy = new JwtStrategy(config);

    expect(() =>
      strategy.validate({
        sub: 'usuario-1',
        roles: ['DESCONOCIDO' as roles],
        sid: 'sesion-1',
      }),
    ).toThrow(UnauthorizedException);
  });
});
