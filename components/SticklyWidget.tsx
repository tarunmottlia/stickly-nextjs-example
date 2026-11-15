'use client';
import Script from 'next/script';
import { useEffect } from 'react';

type Stk = { cmd: Array<(s: any) => void>; shutdown?: () => void };
declare global { interface Window { stk?: Stk } }

const KEY = process.env.NEXT_PUBLIC_STICKLY_PUBLIC_KEY!;

// Mount this ONLY for signed-in users (see app/page.tsx). Live keys refuse
// any claim without a signed identity token, so logged-out pages gain nothing.
export function SticklyWidget() {
  useEffect(() => {
    let cancelled = false;
    fetch('/api/stickly/token', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(({ token }) => {
        if (cancelled) return;
        window.stk = window.stk || { cmd: [] };
        window.stk.cmd.push((s) => s.boot({ key: KEY, token }));
      })
      .catch((e) => console.warn('[stickly] no token', e));
    return () => {
      cancelled = true;
      window.stk?.shutdown?.(); // next user on a shared machine starts clean
    };
  }, []);

  return <Script src="https://cdn.stickly.live/w.js" data-key={KEY} strategy="afterInteractive" />;
}
