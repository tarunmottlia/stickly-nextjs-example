import { createHmac } from 'node:crypto';

// Whatever goes in `sub` is sent to Stickly, sits in a JWT the browser holds,
// and comes back in every webhook. Never send an email: send a stable opaque id.
export function opaqueUserId(realId: string): string {
  const salt = process.env.USER_ID_SALT;
  if (!salt) throw new Error('USER_ID_SALT is not set');
  return 'u_' + createHmac('sha256', salt).update(realId).digest('hex').slice(0, 24);
}
