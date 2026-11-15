// The four probes from Stickly's integration guide. None of them grants credits.
// Usage: STICKLY_WEBHOOK_SECRET=... node scripts/probe-webhook.mjs [baseUrl]
import { createHmac } from 'node:crypto';

const base = process.argv[2] || 'http://localhost:3000';
const url = `${base}/api/stickly/webhook`;
const secret = process.env.STICKLY_WEBHOOK_SECRET;
if (!secret) { console.error('Set STICKLY_WEBHOOK_SECRET'); process.exit(1); }

const body = JSON.stringify({ event: 'reward.claimed', id: 'probe-1', userId: 'u_probe', rewardId: 'probe', credits: 0, mode: 'test' });
const sign = (t) => `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;
const now = () => Math.floor(Date.now() / 1000);

const probes = [
  ['no signature header', {}, 400],
  ['zeroed signature', { 'x-stickly-signature': `t=${now()},v1=${'0'.repeat(64)}` }, 401],
  ['correct signature, 10 min old', { 'x-stickly-signature': sign(now() - 600) }, 401],
  ['correct signature, mode:test', { 'x-stickly-signature': sign(now()) }, 200],
];

let failed = 0;
for (const [name, headers, want] of probes) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body });
  const ok = r.status === want;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${r.status}, want ${want}`);
}
process.exit(failed ? 1 : 0);
