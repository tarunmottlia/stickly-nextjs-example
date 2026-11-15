import { auth } from '@/auth';
import { balanceOf } from '@/lib/credits';
import { opaqueUserId } from '@/lib/opaque-id';

export async function GET() {
  const session = await auth();
  const realId = session?.user?.email;
  if (!realId) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const id = opaqueUserId(realId);
  return Response.json({ userId: id, credits: balanceOf(id) }, { headers: { 'Cache-Control': 'no-store' } });
}
