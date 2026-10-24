import { randomBytes } from 'node:crypto';
import { Router, type CookieOptions, type Request, type Response } from 'express';
import {
  AuthExchangeError,
  buildGoogleAuthUrl,
  deriveRole,
  exchangeCodeForProfile,
  isAuthReady,
  type AuthConfig,
} from './google';
import {
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
  type SessionPayload,
} from './session';

export const SESSION_COOKIE = 'cim_session';
export const OAUTH_STATE_COOKIE = 'cim_oauth_state';
const OAUTH_STATE_TTL_SECONDS = 10 * 60;

/**
 * Reads a single cookie from a `Cookie` header (no dependency). Accepts any
 * object with headers so tests can call it without a full Express request.
 */
export function readCookie(
  req: { headers: { cookie?: string | undefined } },
  name: string,
): string | undefined {
  const header = req.headers.cookie;
  if (!header) {
    return undefined;
  }
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return undefined;
}

function baseCookieOptions(): CookieOptions {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // `strict` would drop the cookie on the cross-site redirect back from
    // Google, so the session cookie is `lax` (still blocks cross-site POSTs).
    secure: process.env.NODE_ENV === 'production',
  };
}

/**
 * `/api/auth/*` routes.
 *
 * - `GET  /config`          — tells the client whether Google sign-in works.
 * - `GET  /me`              — the current session, or `{ user: null }`.
 * - `GET  /google`          — redirects to Google's consent screen.
 * - `GET  /google/callback` — validates state, exchanges the code, sets the
 *                             session cookie, and redirects back to the app.
 * - `POST /logout`          — clears the session cookie.
 *
 * The browser *navigates* to `/google` and lands on `/google/callback`, so
 * every failure answers with a redirect to `/?auth_error=<reason>` and the
 * client shows a plain-language toast. Without keys the flow degrades to the
 * same explanation and the client offers the built-in demo sign-in.
 */
export function createAuthRouter(config: AuthConfig): Router {
  const router = Router();

  router.get('/config', (_req: Request, res: Response) => {
    res.json({ googleSignInEnabled: isAuthReady(config) });
  });

  router.get('/me', (req: Request, res: Response) => {
    const user = verifySession(readCookie(req, SESSION_COOKIE), config.sessionSecret ?? '');
    res.json({ user });
  });

  router.get('/google', (_req: Request, res: Response) => {
    if (!isAuthReady(config)) {
      res.redirect(302, '/?auth_error=not_configured');
      return;
    }
    const state = randomBytes(24).toString('base64url');
    res.cookie(OAUTH_STATE_COOKIE, state, {
      ...baseCookieOptions(),
      maxAge: OAUTH_STATE_TTL_SECONDS * 1000,
    });
    res.redirect(302, buildGoogleAuthUrl(config, state));
  });

  router.get('/google/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query as { code?: string; state?: string };

    // CSRF guard: the state we issued must come back untouched.
    const expectedState = readCookie(req, OAUTH_STATE_COOKIE);
    res.clearCookie(OAUTH_STATE_COOKIE, baseCookieOptions());
    if (!expectedState || !state || state !== expectedState) {
      res.redirect(302, '/?auth_error=state');
      return;
    }
    if (!code) {
      res.redirect(302, '/?auth_error=code');
      return;
    }

    try {
      const profile = await exchangeCodeForProfile(config, code);
      const role = deriveRole(profile.email, config);
      if (!role) {
        res.redirect(302, '/?auth_error=domain');
        return;
      }
      const issuedAt = Math.floor(Date.now() / 1000);
      const payload: SessionPayload = {
        email: profile.email,
        name: profile.name,
        role,
        issuedAt,
        expiresAt: issuedAt + SESSION_MAX_AGE_SECONDS,
      };
      res.cookie(SESSION_COOKIE, signSession(payload, config.sessionSecret ?? ''), {
        ...baseCookieOptions(),
        maxAge: SESSION_MAX_AGE_SECONDS * 1000,
      });
      res.redirect(302, '/?auth=signed_in');
    } catch (error) {
      // AuthExchangeError messages are already user-facing; anything else is
      // logged and folded into the generic reason.
      if (!(error instanceof AuthExchangeError)) {
        console.error('OAuth callback failed:', error);
      }
      res.redirect(302, '/?auth_error=exchange');
    }
  });

  router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE, baseCookieOptions());
    res.json({ ok: true });
  });

  return router;
}
