import { auth } from '@/auth';
import { signUserToken } from '@stickly-live/node';
import { opaqueUserId } from '@/lib/opaque-id';

// Only a signed-in user can get a token. The user id comes from the Auth.js
// session on the server — never from the browser — so nobody can claim as
// someone else by editing a request in DevTools.
export async function GET() {
  const session = await auth();
  const realId = session?.user?.email;
  if (!realId) return Response.json({ error: 'unauthenticated' }, { status: 401 });

  const token = signUserToken(
    { sub: opaqueUserId(realId) },          // no name/email: Activity shows the opaque id
    process.env.STICKLY_SIGNING_SECRET!,
    { expiresInSeconds: 60 * 60 },
  );
  return Response.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}
