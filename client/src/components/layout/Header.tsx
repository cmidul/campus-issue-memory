import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { cn } from '../../lib/cn';
import { useTheme } from '../../theme/useTheme';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

const NAV_ITEMS = [
  { label: 'Browse reports', href: '#reports' },
  { label: 'Statuses', href: '#statuses' },
  { label: 'How it works', href: '#how-it-works' },
] as const;

export interface HeaderProps {
  /** Opens the report composer (the app gates it on sign-in). */
  onReportClick: () => void;
  /** Opens the sign-in dialog. */
  onSignInClick: () => void;
}

/** Two-tier role label, matching the server's model. */
function roleLabel(role: 'visitor' | 'user' | 'admin'): string {
  if (role === 'admin') return 'Campus staff';
  if (role === 'user') return 'Student / teacher / officer';
  return 'Visitor';
}

export function Header({ onReportClick, onSignInClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close the account popover on outside click or Escape while it is open.
  useEffect(() => {
    if (!accountOpen) return;
    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  function handleSignOut() {
    setAccountOpen(false);
    signOut();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pt-[env(safe-area-inset-top)] sm:px-6">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:rounded-lg focus:bg-accent-600 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>

        <a href="#main" className="flex shrink-0 items-center gap-2 py-3">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-white"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path
                d="M10 2.5 3 5.5v4c0 4 3 6.5 7 8 4-1.5 7-4 7-8v-4l-7-3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {/* On the smallest screens only the shield icon shows, so the header
              never overflows (320 px verified). */}
          <span className="hidden text-base font-semibold tracking-tight text-ink sm:inline">
            Campus Issue Memory
          </span>
        </a>

        <nav aria-label="Main" className="ml-4 hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="rounded-xl p-3 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {theme === 'dark' ? (
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <circle cx="10" cy="10" r="3.25" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10 2.5v1.75M10 15.75V17.5M17.5 10h-1.75M4.25 10H2.5M15.3 4.7l-1.24 1.24M5.94 14.06l-1.24 1.24M15.3 15.3l-1.24-1.24M5.94 5.94 4.7 4.7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M16.5 12.4A6.75 6.75 0 0 1 7.6 3.5a6.75 6.75 0 1 0 8.9 8.9Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* One button, responsive label. Note: never pass `hidden` to Button —
              its base `inline-flex` wins over `hidden` in Tailwind v4's sort
              order, so display classes must live on plain child elements. */}
          <Button onClick={onReportClick} aria-label="Report a problem">
            <span className="sm:hidden">Report</span>
            <span className="hidden sm:inline">Report a problem</span>
          </Button>

          {/* Sign-in state: skeleton while the session lookup settles, then
              either the account popover or a Sign in button. */}
          {loading ? (
            <span
              aria-hidden="true"
              className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-2"
            />
          ) : user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-controls="account-menu"
                aria-label={`Account menu for ${user.name}`}
                className="flex items-center gap-1.5 rounded-xl p-1.5 pr-2 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Avatar name={user.name} size="sm" />
                {/* The name only shows once there is room (sm and up). */}
                <span className="hidden max-w-24 truncate text-sm font-medium text-ink sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                  <path
                    d="m5.5 8 4.5 4.5L14.5 8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {accountOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 top-full z-50 mt-1 w-60 rounded-xl border border-line bg-surface p-1 shadow-md"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-muted">{user.email}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-ink-muted">
                        {roleLabel(user.role)}
                      </span>
                      {user.isDemo && (
                        <span className="rounded bg-accent-50 px-1.5 py-0.5 text-xs font-medium text-accent-700">
                          demo
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="border-t border-line pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={onSignInClick}>
              Sign in
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="rounded-xl p-3 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path
                d="M3.5 6h13M3.5 10h13M3.5 14h13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setMenuOpen(false);
          }
        }}
        className="border-t border-line bg-surface md:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'block rounded-xl px-3 py-3 text-base font-medium text-ink transition-colors',
                    'hover:bg-surface-2',
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
