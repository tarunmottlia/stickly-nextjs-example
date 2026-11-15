// A stand-in for YOUR credit ledger. Replace with a database table that has a
// UNIQUE constraint on the idempotency key, e.g.
//   INSERT INTO credit_grants (idempotency_key, user_id, credits) VALUES (...)
//   ON CONFLICT (idempotency_key) DO NOTHING;
// In-memory state resets on every cold start, which is fine for a demo only.
const g = globalThis as unknown as {
  __balances?: Map<string, number>;
  __seen?: Set<string>;
};
const balances = (g.__balances ??= new Map());
const seen = (g.__seen ??= new Set());

export function grantCredits(userId: string, credits: number, idempotencyKey: string): boolean {
  if (seen.has(idempotencyKey)) return false; // a retry: already granted
  seen.add(idempotencyKey);
  balances.set(userId, (balances.get(userId) ?? 0) + credits);
  return true;
}

export function balanceOf(userId: string): number {
  return balances.get(userId) ?? 0;
}
