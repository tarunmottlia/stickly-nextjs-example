import { tryVerifyWebhook, shouldGrant } from '@stickly-live/node';
import { grantCredits } from '@/lib/credits';

export const runtime = 'nodejs';        // node:crypto, not the Edge runtime
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const raw = await req.text();          // RAW bytes: verify first, parse after
  const result = tryVerifyWebhook(
    raw,
    req.headers.get('x-stickly-signature'),
    process.env.STICKLY_WEBHOOK_SECRET!,
  );

  if (!result.ok) {
    const status = ['missing_signature', 'malformed_signature', 'bad_json'].includes(result.reason) ? 400 : 401;
    return Response.json({ error: result.reason }, { status });
  }

  const event = result.event;
  // shouldGrant() is false for test keys and dashboard test deliveries:
  // their userId was never verified, so they must not move a balance.
  if (shouldGrant(event)) {
    grantCredits(event.userId, event.credits, event.id); // event.id = idempotency key
  }
  // 200 even for things we ignore — a non-2xx is retried for six hours.
  return Response.json({ ok: true });
}
