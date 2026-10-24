import { REPORT_STATUS_META, getCategoryMeta } from '@cim/shared';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import type { DemoReport } from '../../data/demoReports';

export interface ReportCardProps {
  report: DemoReport;
}

/** One report in the feed: photo (or video note), status, category, details. */
export function ReportCard({ report }: ReportCardProps) {
  const category = getCategoryMeta(report.category);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      {report.image ? (
        <img
          src={report.image.src}
          alt={report.image.alt}
          loading="lazy"
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-surface-2">
          <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-ink-muted">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-8 w-8">
              <rect
                x="2.5"
                y="4.5"
                width="15"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="m8.5 8 4 2.5-4 2.5V8Z" fill="currentColor" />
            </svg>
            {report.videoLabel ?? 'No photo'}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={report.status} />
          <Badge tone="neutral">{category.label}</Badge>
          {report.severity === 'high' && <Badge tone="danger">High priority</Badge>}
        </div>

        <h3 className="text-base font-semibold leading-snug text-ink">{report.title}</h3>

        <p className="line-clamp-2 text-sm text-ink-muted">{report.description}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path
                d="M10 17s5.5-4.2 5.5-8.5a5.5 5.5 0 1 0-11 0C4.5 12.8 10 17 10 17Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="10" cy="8.5" r="1.75" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {report.location}
          </span>
          <span>{report.createdAt}</span>
        </div>

        <details className="mt-1 rounded-xl bg-surface-2 px-3 py-2.5">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink">
            <span className="inline-flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4 text-ink-muted"
              >
                <path
                  d="M10 6.5v7M6.5 10h7"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              View updates ({report.history.length})
            </span>
          </summary>
          <ol className="mt-3 flex flex-col gap-2 border-l border-line pl-3">
            {report.history.map((entry) => (
              <li key={`${report.id}-${entry.status}-${entry.date}`} className="text-xs">
                <span className="font-medium text-ink">
                  {REPORT_STATUS_META[entry.status].label}
                </span>{' '}
                <span className="text-ink-muted">· {entry.date}</span>
                <p className="mt-0.5 text-ink-muted">{entry.note}</p>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </article>
  );
}
