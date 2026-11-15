import { auth, signIn, signOut } from '@/auth';
import { SticklyWidget } from '@/components/SticklyWidget';
import { balanceOf } from '@/lib/credits';
import { opaqueUserId } from '@/lib/opaque-id';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <main>
        <h1>Stickly + Next.js example</h1>
        <p>Sign in (demo provider, any email) to see the rewards widget.</p>
        <form action={async (fd) => { 'use server'; await signIn('credentials', { email: fd.get('email'), redirectTo: '/' }); }}>
          <input name="email" type="email" placeholder="you@example.com" required />{' '}
          <button type="submit">Sign in</button>
        </form>
      </main>
    );
  }

  const id = opaqueUserId(email);
  return (
    <main>
      <h1>Signed in as {email}</h1>
      <p>Opaque id sent to Stickly: <code>{id}</code></p>
      <p>Credits in this app&apos;s ledger: <strong>{balanceOf(id)}</strong></p>
      <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
        <button type="submit">Sign out</button>
      </form>
      <SticklyWidget />
    </main>
  );
}
