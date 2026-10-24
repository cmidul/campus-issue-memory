import type { SessionRole } from './session';

/**
 * Google OAuth "Sign in with Google" plus the campus e-mail gate.
 *
 * Everything here is optional: without keys the server reports
 * `googleSignInEnabled: false` and the client falls back to the built-in demo
 * sign-in, so the demo keeps running with zero configuration.
 */

export interface AuthConfig {
  googleClientId?: string;
  googleClientSecret?: string;
  /** HMAC secret for session cookies; required before any cookie is set. */
  sessionSecret?: string;
  /** Only e-mails ending in `@<domain>` may sign in (lower-case, no "@"). */
  universityEmailDomain?: string;
  /** E-mails that receive the `admin` role (lower-case). */
  adminEmails: string[];
  /** Public base URL of this server; the OAuth redirect URI is derived from it. */
  appBaseUrl: string;
}

export function readAuthConfig(env: Record<string, string | undefined>): AuthConfig {
  return {
    googleClientId: env.GOOGLE_CLIENT_ID?.trim() || undefined,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET?.trim() || undefined,
    sessionSecret: env.SESSION_SECRET?.trim() || undefined,
    universityEmailDomain:
      env.UNIVERSITY_EMAIL_DOMAIN?.trim().toLowerCase().replace(/^@/, '') || undefined,
    adminEmails: (env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
    appBaseUrl: env.APP_BASE_URL?.trim().replace(/\/$/, '') || 'http://localhost:4000',
  };
}

export function isGoogleConfigured(config: AuthConfig): boolean {
  return Boolean(config.googleClientId && config.googleClientSecret);
}

export function isAuthReady(config: AuthConfig): boolean {
  return isGoogleConfigured(config) && Boolean(config.sessionSecret);
}

export function callbackUrl(config: AuthConfig): string {
  return `${config.appBaseUrl}/api/auth/google/callback`;
}

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_SCOPES = 'openid email profile';

/** Builds the consent-screen URL the browser is redirected to. */
export function buildGoogleAuthUrl(config: AuthConfig, state: string): string {
  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.searchParams.set('client_id', config.googleClientId ?? '');
  url.searchParams.set('redirect_uri', callbackUrl(config));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GOOGLE_SCOPES);
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

export interface GoogleProfile {
  email: string;
  name: string;
}

/** Thrown for any OAuth failure; routes turn it into a plain-language result. */
export class AuthExchangeError extends Error {}

/**
 * Trades the callback `code` for tokens, then reads the verified profile.
 * `fetchImpl` is injectable so tests never touch the network.
 */
export async function exchangeCodeForProfile(
  config: AuthConfig,
  code: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GoogleProfile> {
  const tokenResponse = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId ?? '',
      client_secret: config.googleClientSecret ?? '',
      redirect_uri: callbackUrl(config),
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenResponse.ok) {
    throw new AuthExchangeError('Google rejected the sign-in code.');
  }
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) {
    throw new AuthExchangeError('Google did not issue an access token.');
  }

  const profileResponse = await fetchImpl(GOOGLE_USERINFO_ENDPOINT, {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileResponse.ok) {
    throw new AuthExchangeError('Google did not return a profile.');
  }
  const profile = (await profileResponse.json()) as {
    email?: string;
    name?: string;
    email_verified?: boolean;
  };
  if (!profile.email || profile.email_verified === false) {
    throw new AuthExchangeError('Google did not return a verified e-mail address.');
  }
  const email = profile.email.trim().toLowerCase();
  return {
    email,
    name: profile.name?.trim() || email.split('@')[0],
  };
}

/**
 * Two tiers: `admin` (listed in ADMIN_EMAILS — staff), `user` (any e-mail on
 * the campus domain — students, teachers, officers), or `null` when the
 * address is rejected by the domain gate.
 */
export function deriveRole(email: string, config: AuthConfig): SessionRole | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (config.adminEmails.includes(normalized)) {
    return 'admin';
  }
  if (config.universityEmailDomain && normalized.endsWith(`@${config.universityEmailDomain}`)) {
    return 'user';
  }
  return null;
}
