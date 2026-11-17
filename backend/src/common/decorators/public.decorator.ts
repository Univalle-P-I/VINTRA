import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marks a route public when an application-wide JWT guard is enabled. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
