import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from './authenticated-user';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const UsuarioAutenticado = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;

    if (!user) {
      throw new UnauthorizedException(
        'La solicitud no tiene una identidad autenticada.',
      );
    }

    return user;
  },
);
