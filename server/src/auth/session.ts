import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signed-cookie sessions (no database yet — Milestone 2 adds Supabase).
 *
 * The cookie value is `<base64url payload>.<hmac signature>`. The server never
 * stores sessions; the signature + expiry make the cookie self-validating and
 * tamper-proof. `HttpOnly` keeps it out of reach of scripts, `SameSite=Lax`
 * blocks cross-site form/CSRF posts while still allowing the OAuth redirect
 * to land on the callback route.
 */

/** Two tiers only: any campus e-mail holder is a `user`; `admin` is staff. */
export type SessionRole = 'user' | 'admin';

export interface SessionPayload {
  email: string;
  name: string;
  role: SessionRole;
  /** Issued / expires at, in epoch seconds. */
  issuedAt: number;
  expiresAt: number;
}

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // one week

function base64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function hmac(secret: string, data: string): string {
  return createHmac('sha256', secret).update(data, 'utf8').digest('base64url');
}

/** Produces the tamper-evident cookie value for a session payload. */
export function signSession(payload: SessionPayload, secret: string): string {
  const body = base64url(JSON.stringify(payload));
  return `${body}.${hmac(secret, body)}`;
}

/**
 * Verifies a cookie value. Returns the payload, or `null` for a bad
 * signature, malformed body, missing fields, or an expired session.
 */
export function verifySession(
  value: string | undefined,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): SessionPayload | null {
  if (!value) {
    return null;
  }
  const separator = value.lastIndexOf('.');
  if (separator < 1) {
    return null;
  }
  const body = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  const expected = hmac(secret, body);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }
  const candidate = parsed as Partial<SessionPayload>;
  if (
    typeof candidate.email !== 'string' ||
    typeof candidate.name !== 'string' ||
    (candidate.role !== 'user' && candidate.role !== 'admin') ||
    typeof candidate.issuedAt !== 'number' ||
    typeof candidate.expiresAt !== 'number'
  ) {
    return null;
  }
  if (candidate.expiresAt <= nowSeconds) {
    return null;
  }
  return candidate as SessionPayload;
}
