import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { roles } from '../../common/enums/roles.enum';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

const KNOWN_ROLES = new Set<string>(Object.values(roles));

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }


  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload || typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException('El token no contiene un usuario válido.');
    }

    const tokenRoles = payload.roles ?? [];
    if (
      !Array.isArray(tokenRoles) ||
      tokenRoles.some((role) => !KNOWN_ROLES.has(role))
    ) {
      throw new UnauthorizedException('El token contiene roles no válidos.');
    }

    return {
      id: payload.sub,
      ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
      roles: tokenRoles,
      ...(typeof payload.sid === 'string' ? { sid: payload.sid } : {}),
    };
  }
}
