import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, REPORT_STATUSES, REPORT_STATUS_META } from '@cim/shared';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ReportCard } from './components/report/ReportCard';
import { ReportDialog } from './components/report/ReportDialog';
import { Button } from './components/ui/Button';
import { FormField } from './components/ui/FormField';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { StatusBadge } from './components/ui/StatusBadge';
import { ToastProvider } from './components/ui/Toast';
import { DEMO_REPORTS, DEMO_VIEWER, type DemoReport } from './data/demoReports';

const OPEN_STATUSES = new Set(['submitted', 'under_review', 'verified', 'in_progress', 'reopened']);

type StatusFilter = 'all' | 'open' | 'fixed';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Still open' },
  { id: 'fixed', label: 'Fixed' },
];

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

export default function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  // Demo-only: show skeletons briefly so the loading state is visible.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const filtered = useMemo(
    () => DEMO_REPORTS.filter((report) => matchesFilters(report, query, category, statusFilter)),
    [query, category, statusFilter],
  );

  function clearFilters() {
    setQuery('');
    setCategory('');
    setStatusFilter('all');
  }

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col bg-canvas">
        <Header onReportClick={() => setDialogOpen(true)} />

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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700"
              >
                AK
              </span>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="min-h-11 flex-1 rounded-full border border-line bg-surface px-4 text-left text-sm text-ink-muted transition-colors hover:bg-surface-2"
              >
                Seen a problem on campus, {DEMO_VIEWER.name.split(' ')[0]}?
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <Button variant="ghost" onClick={() => setDialogOpen(true)} className="min-h-11">
                📷 Photo or clip
              </Button>
              <Button variant="ghost" onClick={() => setDialogOpen(true)} className="min-h-11">
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
            {loading ? (
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
                  <dd className="text-sm text-ink-muted">
                    {REPORT_STATUS_META[status].description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* How it works */}
          <section
            aria-labelledby="how-it-works-heading"
            className="scroll-mt-20"
            id="how-it-works"
          >
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
      </div>
    </ToastProvider>
  );
}
