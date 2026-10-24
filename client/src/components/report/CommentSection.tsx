import { useState, type FormEvent } from 'react';
import type { Comment } from '@cim/shared';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export interface CommentSectionProps {
  comments: Comment[];
  /** Currently signed-in viewer; they author new comments. */
  viewerName: string;
  onAdd: (text: string) => void;
  className?: string;
}

const MAX_LENGTH = 600;

/**
 * Facebook-style comment thread under a post: existing comments plus a compact
 * composer for the signed-in viewer.
 */
export function CommentSection({ comments, viewerName, onAdd, className }: CommentSectionProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (text.length === 0) {
      setError('Write something first.');
      return;
    }
    if (text.length > MAX_LENGTH) {
      setError(`Comments can be up to ${MAX_LENGTH} characters.`);
      return;
    }
    onAdd(text);
    setDraft('');
    setError(null);
  }

  return (
    <div aria-label="Comments" role="group" className={cn('flex flex-col gap-3', className)}>
      {comments.length > 0 && (
        <p className="text-xs font-medium text-ink-muted">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {comments.map((comment) => (
          <li key={comment.id} className="flex items-start gap-2">
            <Avatar name={comment.authorName} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="rounded-2xl bg-surface-2 px-3 py-2">
                <p className="text-sm font-semibold text-ink">{comment.authorName}</p>
                <p className="break-words text-sm text-ink">{comment.text}</p>
              </div>
              <p className="mt-0.5 px-3 text-xs text-ink-muted">{comment.createdAt}</p>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <Avatar name={viewerName} size="sm" />
        <div className="min-w-0 flex-1">
          <label htmlFor={`comment-input-${viewerName.replace(/\s+/g, '-')}`} className="sr-only">
            Write a comment
          </label>
          <input
            id={`comment-input-${viewerName.replace(/\s+/g, '-')}`}
            type="text"
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Write a comment…"
            aria-describedby={error ? 'comment-error' : undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              'block w-full rounded-full border bg-surface px-4 py-2 text-base text-ink placeholder:text-ink-muted',
              'focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25',
              error ? 'border-danger' : 'border-line',
            )}
          />
          {error && (
            <p id="comment-error" role="alert" className="mt-1 text-xs font-medium text-danger">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" size="sm" disabled={draft.trim().length === 0}>
          Post
        </Button>
      </form>
    </div>
  );
}
