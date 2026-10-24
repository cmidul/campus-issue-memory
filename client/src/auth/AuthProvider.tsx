import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { UserRole } from '@cim/shared';

/**
 * Authentication state for the client.
 *
 * The real session comes from the server's signed `cim_session` cookie (Google
 * OAuth, campus-domain gate). When the API is unreachable or unconfigured —
 * the zero-key demo — the visitor can "explore as" the built-in demo account,
 * which is stored in `localStorage` and clearly marked `isDemo`.
 *
 * Two role tiers, matching the server: `user` (any campus e-mail holder) and
 * `admin` (staff listed in ADMIN_EMAILS). Unauthenticated visitors have
 * `user: null` (role `visitor`).
 */

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  /** True when signed in via the built-in demo account (no server). */
  isDemo: boolean;
}

/** The zero-key demo account: an admin on the sample campus domain. */
export const DEMO_AUTH_USER: AuthUser = {
  name: 'Alex Kim',
  email: 'alex.kim@university.edu',
  role: 'admin',
  isDemo: true,
};

const DEMO_STORAGE_KEY = 'cim.demo-session';

interface AuthContextValue {
  user: AuthUser | null;
  /** True until the initial session lookup has settled. */
  loading: boolean;
  /** True when the server can complete a real Google sign-in. */
  googleEnabled: boolean;
  /** Signs in as the built-in demo account (works with zero keys). */
  signInDemo(): void;
  /** Clears both the server session and the local demo session. */
  signOut(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Returns the auth API; must be used inside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return value;
}

interface MeResponse {
  user: { email: string; name: string; role: 'user' | 'admin' } | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      let serverUser: AuthUser | null = null;
      let google = false;
      try {
        const [configResponse, meResponse] = await Promise.all([
          fetch('/api/auth/config'),
          fetch('/api/auth/me'),
        ]);
        if (configResponse.ok) {
          const config = (await configResponse.json()) as { googleSignInEnabled?: boolean };
          google = config.googleSignInEnabled === true;
        }
        if (meResponse.ok) {
          const me = (await meResponse.json()) as MeResponse;
          if (me.user) {
            serverUser = { ...me.user, isDemo: false };
          }
        }
      } catch {
        // API not running — the demo works without it.
      }
      if (cancelled) {
        return;
      }
      const demoSignedIn = window.localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
      setUser(serverUser ?? (demoSignedIn ? DEMO_AUTH_USER : null));
      setGoogleEnabled(google);
      setLoading(false);
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const signInDemo = useCallback(() => {
    window.localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    setUser(DEMO_AUTH_USER);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
    setUser(null);
    // Best effort: clear the server session if there is one.
    void fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ user, loading, googleEnabled, signInDemo, signOut }),
    [user, loading, googleEnabled, signInDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
