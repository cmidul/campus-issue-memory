import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';
import { buildGoogleAuthUrl, deriveRole, readAuthConfig, type AuthConfig } from './google';
import { OAUTH_STATE_COOKIE, SESSION_COOKIE, readCookie } from './routes';
import { signSession, verifySession } from './session';

const CONFIG: AuthConfig = {
  googleClientId: 'test-client-id',
  googleClientSecret: 'test-client-secret',
  sessionSecret: 'test-session-secret',
  universityEmailDomain: 'university.edu',
  adminEmails: ['alex.kim@university.edu'],
  appBaseUrl: 'http://localhost:4000',
};

/** App with no keys — the demo/degraded mode. */
const demoApp = createApp(readAuthConfig({}));
const app = createApp(CONFIG);

describe('session cookies', () => {
  it('round-trips a payload through sign and verify', () => {
    const issuedAt = 1_700_000_000;
    const value = signSession(
      {
        email: 'alex.kim@university.edu',
        name: 'Alex Kim',
        role: 'admin',
        issuedAt,
        expiresAt: issuedAt + 60,
      },
      CONFIG.sessionSecret ?? '',
    );

    const verified = verifySession(value, CONFIG.sessionSecret ?? '', issuedAt + 30);

    expect(verified).toMatchObject({ email: 'alex.kim@university.edu', role: 'admin' });
  });

  it('rejects a tampered payload', () => {
    const value = signSession(
      {
        email: 'someone@university.edu',
        name: 'Someone',
        role: 'user',
        issuedAt: 1_700_000_000,
        expiresAt: 1_700_000_060,
      },
      CONFIG.sessionSecret ?? '',
    );
    const [body, signature] = value.split('.');
    const forgedBody = Buffer.from(
      JSON.stringify({
        email: 'someone@university.edu',
        name: 'Someone',
        role: 'admin',
        issuedAt: 1_700_000_000,
        expiresAt: 1_700_000_060,
      }),
    ).toString('base64url');

    expect(verifySession(`${forgedBody}.${signature}`, CONFIG.sessionSecret ?? '')).toBeNull();
    expect(verifySession(`${body}.not-the-signature`, CONFIG.sessionSecret ?? '')).toBeNull();
  });

  it('rejects an expired session', () => {
    const value = signSession(
      {
        email: 'someone@university.edu',
        name: 'Someone',
        role: 'user',
        issuedAt: 1_700_000_000,
        expiresAt: 1_700_000_060,
      },
      CONFIG.sessionSecret ?? '',
    );

    expect(verifySession(value, CONFIG.sessionSecret ?? '', 1_700_000_061)).toBeNull();
  });
});

describe('readAuthConfig', () => {
  it('normalizes the domain and admin list', () => {
    const config = readAuthConfig({
      UNIVERSITY_EMAIL_DOMAIN: '@University.EDU',
      ADMIN_EMAILS: ' Alex.Kim@University.edu ,  staff@university.edu ',
      APP_BASE_URL: 'https://cim.example/',
    });

    expect(config.universityEmailDomain).toBe('university.edu');
    expect(config.adminEmails).toEqual(['alex.kim@university.edu', 'staff@university.edu']);
    expect(config.appBaseUrl).toBe('https://cim.example');
  });
});

describe('deriveRole', () => {
  it('gives the admin role to listed addresses', () => {
    expect(deriveRole('alex.kim@university.edu', CONFIG)).toBe('admin');
  });

  it('gives the user role to any campus-domain address', () => {
    expect(deriveRole('priya.s@university.edu', CONFIG)).toBe('user');
  });

  it('rejects addresses outside the campus domain', () => {
    expect(deriveRole('someone@gmail.com', CONFIG)).toBeNull();
    expect(deriveRole('', CONFIG)).toBeNull();
  });
});

describe('buildGoogleAuthUrl', () => {
  it('points at Google with the callback, scopes, and state', () => {
    const url = new URL(buildGoogleAuthUrl(CONFIG, 'state-123'));

    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.searchParams.get('client_id')).toBe('test-client-id');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:4000/api/auth/google/callback',
    );
    expect(url.searchParams.get('state')).toBe('state-123');
    expect(url.searchParams.get('scope')).toContain('email');
  });
});

describe('GET /api/auth/config', () => {
  it('reports Google sign-in as disabled without keys', async () => {
    const response = await request(demoApp).get('/api/auth/config');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ googleSignInEnabled: false });
  });

  it('reports Google sign-in as enabled with keys and a session secret', async () => {
    const response = await request(app).get('/api/auth/config');

    expect(response.body).toEqual({ googleSignInEnabled: true });
  });
});

describe('GET /api/auth/me', () => {
  it('returns no user without a cookie', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: null });
  });

  it('returns the session for a valid cookie', async () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const cookie = signSession(
      {
        email: 'priya.s@university.edu',
        name: 'Priya S.',
        role: 'user',
        issuedAt,
        expiresAt: issuedAt + 60,
      },
      CONFIG.sessionSecret ?? '',
    );

    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${SESSION_COOKIE}=${cookie}`);

    expect(response.body.user).toMatchObject({ email: 'priya.s@university.edu', role: 'user' });
  });

  it('ignores a tampered cookie', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${SESSION_COOKIE}=forged.value`);

    expect(response.body).toEqual({ user: null });
  });
});

describe('GET /api/auth/google', () => {
  it('redirects home with an error when not configured', async () => {
    const response = await request(demoApp).get('/api/auth/google');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/?auth_error=not_configured');
  });

  it('redirects to Google with a state cookie', async () => {
    const response = await request(app).get('/api/auth/google');

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    const setCookies = response.headers['set-cookie'] as unknown as string[];
    expect(
      readCookie({ headers: { cookie: setCookies.join('; ') } }, OAUTH_STATE_COOKIE),
    ).toBeTruthy();
  });
});

describe('GET /api/auth/google/callback', () => {
  it('rejects a state mismatch', async () => {
    const response = await request(app)
      .get('/api/auth/google/callback')
      .set('Cookie', `${OAUTH_STATE_COOKIE}=expected`)
      .query({ code: 'good-code', state: 'tampered' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/?auth_error=state');
  });

  it('accepts a verified campus e-mail and sets the session cookie', async () => {
    const fetchMock = vi.fn(async (input: Parameters<typeof fetch>[0]) => {
      const url = String(input);
      if (url.includes('oauth2.googleapis.com/token')) {
        return new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          email: 'Alex.Kim@University.edu',
          name: 'Alex Kim',
          email_verified: true,
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    try {
      const response = await request(app)
        .get('/api/auth/google/callback')
        .set('Cookie', `${OAUTH_STATE_COOKIE}=expected-state`)
        .query({ code: 'good-code', state: 'expected-state' });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?auth=signed_in');
      // Node exposes Set-Cookie as an array; supertest's header type is loose.
      const setCookies = response.headers['set-cookie'] as unknown as string[];
      const cookieHeader = setCookies.join('; ');
      expect(cookieHeader).toContain(`${SESSION_COOKIE}=`);
      expect(cookieHeader).toContain('HttpOnly');
      const sessionCookie = readCookie({ headers: { cookie: cookieHeader } }, SESSION_COOKIE);
      expect(verifySession(sessionCookie, CONFIG.sessionSecret ?? '')).toMatchObject({
        email: 'alex.kim@university.edu',
        role: 'admin',
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('rejects e-mails outside the campus domain', async () => {
    const fetchMock = vi.fn(async (input: Parameters<typeof fetch>[0]) => {
      const url = String(input);
      if (url.includes('oauth2.googleapis.com/token')) {
        return new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 });
      }
      return new Response(JSON.stringify({ email: 'someone@gmail.com', email_verified: true }), {
        status: 200,
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    try {
      const response = await request(app)
        .get('/api/auth/google/callback')
        .set('Cookie', `${OAUTH_STATE_COOKIE}=expected-state`)
        .query({ code: 'good-code', state: 'expected-state' });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?auth_error=domain');
      const setCookies = response.headers['set-cookie'] as unknown as string[] | undefined;
      expect(setCookies?.join('; ') ?? '').not.toContain(`${SESSION_COOKIE}=`);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the session cookie', async () => {
    const response = await request(app).post('/api/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(String(response.headers['set-cookie'])).toContain(`${SESSION_COOKIE}=;`);
  });
});
