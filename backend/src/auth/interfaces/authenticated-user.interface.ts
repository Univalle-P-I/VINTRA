import type { roles } from '../../common/enums/roles.enum';

/** Minimal identity attached to `request.user` after JWT verification. */
export interface AuthenticatedUser {
  id: string;
  email?: string;
  roles: roles[];
  sid?: string;
}
