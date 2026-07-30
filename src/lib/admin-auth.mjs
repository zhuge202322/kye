import { createHmac, timingSafeEqual } from 'node:crypto';

const encode = (value) => Buffer.from(String(value)).toString('base64url');
const sign = (payload, secret) => createHmac('sha256', secret).update(payload).digest('base64url');

export function createSessionToken(secret, lifetimeMs = 8 * 60 * 60 * 1000, now = Date.now()) {
  if (!secret) throw new Error('Session secret is required.');
  const payload = encode(JSON.stringify({ expiresAt: now + lifetimeMs }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token, secret, now = Date.now()) {
  try {
    const [payload, signature, extra] = String(token ?? '').split('.');
    if (!payload || !signature || extra || !secret) return false;
    const expected = sign(payload, secret);
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(parsed.expiresAt) && parsed.expiresAt >= now;
  } catch {
    return false;
  }
}
