import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Demo-only provider so the example runs with zero OAuth setup.
// Swap it for GitHub, Google, Resend, etc. in a real app — nothing else changes.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Demo',
      credentials: { email: { label: 'Email', type: 'email' } },
      authorize: async (c) => {
        const email = typeof c?.email === 'string' ? c.email.trim().toLowerCase() : '';
        if (!email.includes('@')) return null;
        return { id: email, email, name: email.split('@')[0] };
      },
    }),
  ],
});
