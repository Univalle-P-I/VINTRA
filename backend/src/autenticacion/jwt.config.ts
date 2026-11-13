import type { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 900;

export function getAccessTokenTtlSeconds(config: ConfigService): number {
  const ttl = Number(
    config.get(
      'JWT_ACCESS_TOKEN_TTL_SECONDS',
      String(DEFAULT_ACCESS_TOKEN_TTL_SECONDS),
    ),
  );

  if (!Number.isSafeInteger(ttl) || ttl <= 0) {
    throw new Error(
      'JWT_ACCESS_TOKEN_TTL_SECONDS debe ser un entero positivo.',
    );
  }

  return ttl;
}

export function createJwtOptions(config: ConfigService): JwtModuleOptions {
  const secret = config.getOrThrow<string>('JWT_SECRET');
  if (Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 bytes.');
  }

  return {
    secret,
    signOptions: {
      algorithm: 'HS256',
      expiresIn: getAccessTokenTtlSeconds(config),
    },
    verifyOptions: {
      algorithms: ['HS256'],
    },
  };
}
