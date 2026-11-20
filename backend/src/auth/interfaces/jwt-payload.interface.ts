import type { roles } from '../../common/enums/roles.enum';

/** Claims that the API places in an access token. `sub` is the user account id. */
export interface JwtPayload {
  sub: string;
  email?: string;
  roles?: roles[];
  sid?: string;
  iat?: number;
  exp?: number;
}
