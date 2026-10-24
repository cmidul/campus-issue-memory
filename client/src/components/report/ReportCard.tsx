import { useState } from 'react';
import {
  ANONYMOUS_AUTHOR_LABEL,
  REPORT_STATUS_META,
  getCategoryMeta,
  type ReactionType,
} from '@cim/shared';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { StatusBadge } from '../ui/StatusBadge';
import { CommentSection } from './CommentSection';
import { ReactionBar } from './ReactionBar';
import type { DemoReport } from '../../data/demoReports';

export interface ReportCardProps {
  report: DemoReport;
}

/**
 * One post in the Facebook-style feed: author header, description, media,
 * reactions, status history, and a comment thread. Reaction and comment state
 * is local demo state — nothing is sent anywhere.
 */
export function ReportCard({ report }: ReportCardProps) {
  const category = getCategoryMeta(report.category);
  const [reactions, setReactions] = useState(report.reactions);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [comments, setComments] = useState(report.comments);

  function toggleReaction(reaction: ReactionType) {
    if (myReaction === reaction) {
      // Tapping again removes the reaction.
      setReactions((current) => ({ ...current, [reaction]: current[reaction] - 1 }));
      setMyReaction(null);
      return;
    }
    setReactions((current) => {
      const next = { ...current };
      if (myReaction) {
        next[myReaction] -= 1;
      }
      next[reaction] += 1;
      return next;
    });
    setMyReaction(reaction);
  }

  const isAnonymous = report.author.isAnonymous;
  const authorDisplay = isAnonymous ? ANONYMOUS_AUTHOR_LABEL : report.author.name;

  return (
    <article
      aria-label={report.title}
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
    >
      {/* Author header */}
      <header className="flex items-start gap-3 px-4 pt-4">
        <Avatar name={report.author.name} anonymous={isAnonymous} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{authorDisplay}</p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
            <span>{report.createdAt}</span>
            <span aria-hidden="true">·</span>
            <span>{report.location}</span>
          </p>
        </div>
        <StatusBadge status={report.status} />
      </header>

      {/* Post body */}
      <div className="flex flex-col gap-2 px-4 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{category.label}</Badge>
          {report.severity === 'high' && <Badge tone="danger">High priority</Badge>}
        </div>
        <h3 className="text-base font-semibold leading-snug text-ink">{report.title}</h3>
        <p className="text-sm text-ink-muted">{report.description}</p>
      </div>

      {/* Media */}
      {report.image ? (
        <img
          src={report.image.src}
          alt={report.image.alt}
          loading="lazy"
          width={400}
          height={300}
          className="mt-3 aspect-[4/3] w-full object-cover"
        />
      ) : report.videoLabel ? (
        <div className="mt-3 flex aspect-[4/3] w-full items-center justify-center bg-surface-2">
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
            {report.videoLabel}
          </span>
        </div>
      ) : null}

      {/* Reactions + actions */}
      <div className="px-4 pt-3">
        <ReactionBar counts={reactions} selected={myReaction} onToggle={toggleReaction} />
      </div>

      {/* Status history (collapsible) */}
      <div className="px-4 pt-2">
        <details className="rounded-xl bg-surface-2 px-3 py-2.5">
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

      {/* Comments */}
      <div className="px-4 py-3">
        <CommentSection
          comments={comments}
          viewerName="Alex Kim"
          onAdd={(text) =>
            setComments((current) => [
              ...current,
              {
                id: `local-${Date.now()}-${current.length}`,
                authorName: 'Alex Kim',
                text,
                createdAt: 'Just now',
              },
            ])
          }
        />
      </div>
    </article>
  );
}
