# Stickly + Next.js + Auth.js example

A minimal Next.js (App Router) app that shows the three server-side pieces of a
[Stickly](https://stickly.live?utm_source=github&utm_medium=guest&utm_campaign=gp) rewards-widget integration done safely:

1. **The widget** loads only for signed-in users (`components/SticklyWidget.tsx`).
2. **A user token signed on the server** from the Auth.js session — the browser never
   chooses its own user id (`app/api/stickly/token/route.ts`).
3. **A webhook route that grants credits** after verifying the HMAC over the raw body,
   rejecting stale timestamps, ignoring test-mode events and keying every grant on the
   event id so a retry can never credit twice (`app/api/stickly/webhook/route.ts`).

```
user clicks a reward → Stickly records the claim
                     → signed POST to /api/stickly/webhook
                     → this app adds credits to its own ledger (idempotent on event.id)
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftarunmottlia%2Fstickly-nextjs-example&env=AUTH_SECRET,NEXT_PUBLIC_STICKLY_PUBLIC_KEY,STICKLY_SIGNING_SECRET,STICKLY_WEBHOOK_SECRET,USER_ID_SALT)

## Run it

```bash
git clone https://github.com/tarunmottlia/stickly-nextjs-example
cd stickly-nextjs-example
npm install
cp .env.example .env.local      # fill in the values, see below
npm run build && npm start      # or: npm run dev
```

| Variable | Where it comes from | Exposed to the browser? |
|---|---|---|
| `AUTH_SECRET` | `npx auth secret` | no |
| `NEXT_PUBLIC_STICKLY_PUBLIC_KEY` | Stickly dashboard → Settings → API keys (`pk_live_…`) | yes, by design |
| `STICKLY_SIGNING_SECRET` | same `.env` download (`stksign_…`) | **never** |
| `STICKLY_WEBHOOK_SECRET` | created only after you save a webhook URL in Integrate → Connect; download the `.env` again | **never** |
| `USER_ID_SALT` | any random string | no |

The sign-in uses a demo Credentials provider (any email works) so the example runs
with no OAuth app. Swap it for GitHub, Google or a magic-link provider in `auth.ts`;
nothing else changes.

## Prove the webhook

`scripts/probe-webhook.mjs` sends the four checks from Stickly's integration guide.
None of them moves a balance.

```bash
STICKLY_WEBHOOK_SECRET=... npm run probe -- http://localhost:3000
PASS  no signature header: got 400, want 400
PASS  zeroed signature: got 401, want 401
PASS  correct signature, 10 min old: got 401, want 401
PASS  correct signature, mode:test: got 200, want 200
```

Tested locally on 2026-11-15 with Next.js 16.3.8 and next-auth 5.0.0-beta.32: all four
probes passed, the token route returned 401 without a session and a valid HS256 token
with one, and two deliveries of the same live event id added the credits once.

## Decisions worth copying

- **Opaque user id.** `sub` is an HMAC of the email (`lib/opaque-id.ts`). Whatever you
  put there is sent to a third party and comes back in every webhook, so do not send
  emails.
- **Raw body first.** The route calls `req.text()` and verifies before parsing.
  Re-serialising JSON changes the bytes and breaks every signature.
- **Node runtime.** The webhook route sets `runtime = 'nodejs'` because the verifier
  uses `node:crypto`.
- **200 for things you ignore.** Unknown users and test events still get a 200; a non-2xx
  is retried for hours and will not succeed later.
- **A real ledger.** `lib/credits.ts` is in-memory for the demo. In production, use a
  table with a UNIQUE constraint on the event id (`INSERT … ON CONFLICT DO NOTHING`).
- **Exclude the webhook from auth middleware**, or every delivery gets a redirect to
  your login page.
- **CSP.** If your app sends a Content-Security-Policy, allow `cdn.stickly.live` in
  `script-src` and `connect-src`, and `data:` plus `https://www.google.com` in `img-src`.

## Related

- [`@stickly-live/node`](https://www.npmjs.com/package/@stickly-live/node) — the verifier and token signer used here
- [Stickly SDK + agent integration guide](https://github.com/tarunmottlia/stickly)

---

I'm Tarun, founder of Stickly. MIT licensed — copy whatever is useful.
