import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, REPORT_STATUSES, REPORT_STATUS_META } from '@cim/shared';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { SignInDialog } from './components/auth/SignInDialog';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { ReportCard } from './components/report/ReportCard';
import { ReportDialog } from './components/report/ReportDialog';
import { Button } from './components/ui/Button';
import { FormField } from './components/ui/FormField';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { StatusBadge } from './components/ui/StatusBadge';
import { ToastProvider, useToast } from './components/ui/Toast';
import { DEMO_REPORTS, type DemoReport } from './data/demoReports';

const OPEN_STATUSES = new Set(['submitted', 'under_review', 'verified', 'in_progress', 'reopened']);

type StatusFilter = 'all' | 'open' | 'fixed';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Still open' },
  { id: 'fixed', label: 'Fixed' },
];

/**
 * Plain-language toasts for the results the server redirects back with
 * (`/?auth=signed_in` on success, `/?auth_error=<reason>` on failure).
 */
const AUTH_RESULT_MESSAGES: Record<string, { message: string; tone: 'success' | 'danger' }> = {
  signed_in: { message: 'Signed in — welcome back!', tone: 'success' },
  not_configured: {
    message: "Google sign-in isn't configured on this server. Use the demo sign-in instead.",
    tone: 'danger',
  },
  state: { message: 'Sign-in could not be verified. Please try again.', tone: 'danger' },
  code: { message: 'Google did not send a sign-in code. Please try again.', tone: 'danger' },
  domain: {
    message: 'Only university e-mail addresses can sign in to this campus.',
    tone: 'danger',
  },
  exchange: { message: 'Sign-in failed. Please try again in a moment.', tone: 'danger' },
};

function matchesFilters(report: DemoReport, query: string, category: string, status: StatusFilter) {
  const text = query.trim().toLowerCase();
  const matchesQuery =
    text.length === 0 ||
    report.title.toLowerCase().includes(text) ||
    report.description.toLowerCase().includes(text) ||
    report.location.toLowerCase().includes(text);
  const matchesCategory = category === '' || report.category === category;
  const matchesStatus =
    status === 'all' ||
    (status === 'open' ? OPEN_STATUSES.has(report.status) : report.status === 'resolved');
  return matchesQuery && matchesCategory && matchesStatus;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** The page shell; lives inside <AuthProvider> and <ToastProvider>. */
function AppShell() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  /** True when the visitor asked to report *before* signing in. */
  const [reportIntent, setReportIntent] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  // Demo-only: show skeletons briefly so the loading state is visible.
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    if (!feedLoading) return;
    const timer = window.setTimeout(() => setFeedLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, [feedLoading]);

  // Surface the OAuth round-trip result the server redirected back with,
  // then clean the query string so a refresh does not repeat the toast.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('auth_error') ?? params.get('auth');
    if (!key) return;
    const entry = AUTH_RESULT_MESSAGES[key];
    if (entry) toast(entry.message, entry.tone);
    params.delete('auth_error');
    params.delete('auth');
    const rest = params.toString();
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`,
    );
  }, [toast]);

  const filtered = useMemo(
    () => DEMO_REPORTS.filter((report) => matchesFilters(report, query, category, statusFilter)),
    [query, category, statusFilter],
  );

  function clearFilters() {
    setQuery('');
    setCategory('');
    setStatusFilter('all');
  }

  /** Every composer trigger funnels through here: signed in opens the
      composer, visitors get the sign-in dialog instead. */
  function openComposer() {
    if (loading) return; // session lookup still settling
    if (user) {
      setDialogOpen(true);
    } else {
      setReportIntent(true);
      setSignInOpen(true);
    }
  }

  /** Header "Sign in" — no report intent attached. */
  function openSignIn() {
    setReportIntent(false);
    setSignInOpen(true);
  }

  /** After a successful sign-in, resume an interrupted report. */
  function handleSignedIn() {
    if (reportIntent) setDialogOpen(true);
    setReportIntent(false);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Header onReportClick={openComposer} onSignInClick={openSignIn} />

      <main
        id="main"
        className="mx-auto w-full max-w-[680px] flex-1 space-y-4 px-3 pb-16 pt-4 sm:px-6"
      >
        <h1 className="sr-only">Campus Issue Memory — report and track campus problems</h1>
        {/* Facebook-style "create a post" prompt */}
        <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={
                user
                  ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700'
                  : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-muted ring-1 ring-inset ring-line'
              }
            >
              {user ? (
                initialsOf(user.name)
              ) : (
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M4 16.5c1.2-2.5 3.4-3.75 6-3.75s4.8 1.25 6 3.75"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <button
              type="button"
              onClick={openComposer}
              className="min-h-11 flex-1 rounded-full border border-line bg-surface px-4 text-left text-sm text-ink-muted transition-colors hover:bg-surface-2"
            >
              {user
                ? `Seen a problem on campus, ${user.name.split(' ')[0]}?`
                : 'Seen a problem on campus?'}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
            <Button variant="ghost" onClick={openComposer} className="min-h-11">
              📷 Photo or clip
            </Button>
            <Button variant="ghost" onClick={openComposer} className="min-h-11">
              ✏️ Write a report
            </Button>
          </div>
        </section>

        {/* Search + filters */}
        <section aria-labelledby="reports-heading" className="scroll-mt-20" id="reports">
          <h2 id="reports-heading" className="sr-only">
            Recent reports
          </h2>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:flex-row sm:items-end">
            <FormField label="Search reports" className="sm:flex-1">
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “library”, “light”, or “chair”"
              />
            </FormField>

            <FormField label="Category" className="sm:w-52">
              <Select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Status" className="sm:w-40">
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                {STATUS_FILTERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {/* Feed */}
          {feedLoading ? (
            <div role="status" aria-label="Loading reports" className="mt-4 flex flex-col gap-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-line bg-surface p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-2" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-surface-2" />
                      <div className="h-3 w-1/4 rounded bg-surface-2" />
                    </div>
                  </div>
                  <div className="mt-3 h-3 w-3/4 rounded bg-surface-2" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-surface-2" />
                  <div className="mt-3 aspect-[4/3] w-full rounded-xl bg-surface-2" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p aria-live="polite" className="mt-3 text-sm text-ink-muted">
                {filtered.length} {filtered.length === 1 ? 'post' : 'posts'} shown (demo data).
              </p>
              <div className="mt-3 flex flex-col gap-4">
                {filtered.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
              <h3 className="text-base font-semibold text-ink">No posts match your search</h3>
              <p className="max-w-sm text-sm text-ink-muted">
                Try a different word, or clear the filters to see everything again.
              </p>
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </section>

        {/* Statuses explainer */}
        <section aria-labelledby="statuses-heading" className="scroll-mt-20" id="statuses">
          <h2 id="statuses-heading" className="text-lg font-semibold text-ink">
            What the statuses mean
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {REPORT_STATUSES.map((status) => (
              <div
                key={status}
                className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4"
              >
                <dt className="min-w-0">
                  <StatusBadge status={status} />
                </dt>
                <dd className="text-sm text-ink-muted">{REPORT_STATUS_META[status].description}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-it-works-heading" className="scroll-mt-20" id="how-it-works">
          <h2 id="how-it-works-heading" className="text-lg font-semibold text-ink">
            How it works
          </h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Report it',
                text: 'Add a photo or a short clip and a few words. It takes under a minute.',
              },
              {
                step: '2',
                title: 'We track it',
                text: 'Moderators confirm the report, and you can follow every update.',
              },
              {
                step: '3',
                title: 'We remember',
                text: 'If the same problem keeps coming back, it is flagged as recurring.',
              },
            ].map((item) => (
              <li key={item.step} className="rounded-2xl border border-line bg-surface p-4">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-sm font-semibold text-accent-700"
                >
                  {item.step}
                </span>
                <h3 className="mt-2 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <Footer />

      <ReportDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      <SignInDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignedIn={handleSignedIn}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  );
}
