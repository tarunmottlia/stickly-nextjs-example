import { auth, signIn, signOut } from '@/auth';
import { SticklyWidget } from '@/components/SticklyWidget';
import { SubmitButton } from '@/components/SubmitButton';
import { balanceOf } from '@/lib/credits';
import { opaqueUserId } from '@/lib/opaque-id';

export const dynamic = 'force-dynamic';

function HowItWorks() {
  return (
    <section className="card" aria-labelledby="how">
      <h2 id="how">How it works</h2>
      <ol className="steps">
        <li><strong>Widget for signed-in users only.</strong> It mounts after Auth.js has a session.</li>
        <li><strong>Server-signed token.</strong> <code>/api/stickly/token</code> signs the user id on the server; the browser never picks it.</li>
        <li><strong>Webhook grants credits once.</strong> <code>/api/stickly/webhook</code> verifies the HMAC over the raw body and keys every grant on the event id.</li>
      </ol>
    </section>
  );
}

export default async function Home() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <>
        <h1>Rewards widget, signed tokens, idempotent credits</h1>
        <p className="lede">
          A Next.js App Router + Auth.js starter for the Stickly rewards widget. Sign in with any
          email (demo provider, no email is sent) to load the widget.
        </p>
        <section className="card" aria-labelledby="signin">
          <h2 id="signin">Sign in</h2>
          <form
            action={async (fd) => {
              'use server';
              await signIn('credentials', { email: fd.get('email'), redirectTo: '/' });
            }}
          >
            <label htmlFor="email">Email</label>
            <div className="row">
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com…"
                required
              />
              <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
            </div>
            <p className="hint">Demo Credentials provider. Swap it for GitHub, Google or a magic link in <code>auth.ts</code>.</p>
          </form>
        </section>
        <HowItWorks />
      </>
    );
  }

  const id = opaqueUserId(email);
  return (
    <>
      <h1>You&rsquo;re signed in</h1>
      <p className="lede">The rewards widget loads for your session. Claim a reward and the webhook adds credits to the ledger below (refresh to see the new balance).</p>
      <section className="card" aria-labelledby="acct">
        <h2 id="acct">Your account</h2>
        <dl className="facts">
          <dt>Email</dt>
          <dd>{email}</dd>
          <dt>Id sent to Stickly</dt>
          <dd><code>{id}</code></dd>
          <dt>Credits</dt>
          <dd className="num">{balanceOf(id)}</dd>
        </dl>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <SubmitButton className="secondary" pendingText="Signing out…">Sign out</SubmitButton>
        </form>
      </section>
      <HowItWorks />
      <SticklyWidget />
    </>
  );
}
