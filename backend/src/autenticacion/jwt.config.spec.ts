import { ConfigService } from '@nestjs/config';

import {
  createJwtOptions,
  DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  getAccessTokenTtlSeconds,
} from './jwt.config';

describe('JWT configuration', () => {
  function createConfig(values: Record<string, string>): ConfigService {
    return {
      getOrThrow: (key: string) => {
        const value = values[key];
        if (value === undefined) {
          throw new Error(`Missing config: ${key}`);
        }
        return value;
      },
      get: (key: string, defaultValue: string) => values[key] ?? defaultValue,
    } as unknown as ConfigService;
  }

  it('uses a required strong secret and a configurable access token lifetime', () => {
    const config = createConfig({
      JWT_SECRET: 'a-secure-test-secret-with-at-least-32-bytes',
      JWT_ACCESS_TOKEN_TTL_SECONDS: '600',
    });

    expect(createJwtOptions(config)).toEqual({
      secret: 'a-secure-test-secret-with-at-least-32-bytes',
      signOptions: { algorithm: 'HS256', expiresIn: 600 },
      verifyOptions: { algorithms: ['HS256'] },
    });
    expect(getAccessTokenTtlSeconds(config)).toBe(600);
  });

  it('defaults the initial access token lifetime to 900 seconds', () => {
    expect(getAccessTokenTtlSeconds(createConfig({}))).toBe(
      DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
    );
  });

  it('rejects weak secrets and invalid token lifetimes', () => {
    expect(() =>
      createJwtOptions(createConfig({ JWT_SECRET: 'too-short' })),
    ).toThrow('JWT_SECRET debe tener al menos 32 bytes.');

    expect(() =>
      getAccessTokenTtlSeconds({
        get: () => '0',
      } as unknown as ConfigService),
    ).toThrow('JWT_ACCESS_TOKEN_TTL_SECONDS debe ser un entero positivo.');
  });
});
