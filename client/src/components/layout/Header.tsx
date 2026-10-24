import { useState } from 'react';
import { cn } from '../../lib/cn';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';

const NAV_ITEMS = [
  { label: 'Browse reports', href: '#reports' },
  { label: 'Statuses', href: '#statuses' },
  { label: 'How it works', href: '#how-it-works' },
] as const;

export interface HeaderProps {
  /** Opens the report composer dialog. */
  onReportClick: () => void;
}

export function Header({ onReportClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <span className="text-base font-semibold tracking-tight text-ink">
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
            className="rounded-xl p-2.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
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

          <Button onClick={onReportClick} className="hidden sm:inline-flex">
            Report a problem
          </Button>
          {/* Compact primary action for the smallest screens. */}
          <Button onClick={onReportClick} className="sm:hidden" aria-label="Report a problem">
            Report
          </Button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="rounded-xl p-2.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
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
