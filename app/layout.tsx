import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stickly + Next.js + Auth.js example',
  description:
    'Next.js App Router example: a rewards widget for signed-in users, a server-signed user token, and a webhook route that grants credits once per event.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="shell">
          <header className="top">
            <span className="brand">Stickly × Next.js</span>
            <nav aria-label="Project links">
              <a href="https://github.com/tarunmottlia/stickly-nextjs-example">Source</a>
              <a href="https://stickly.live?utm_source=vercel&utm_medium=guest&utm_campaign=gp">Stickly</a>
            </nav>
          </header>
          <main id="main">{children}</main>
          <footer>
            MIT licensed example. The credit ledger is in memory and resets on every cold start.
          </footer>
        </div>
      </body>
    </html>
  );
}
