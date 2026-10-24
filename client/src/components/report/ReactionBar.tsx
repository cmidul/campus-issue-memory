import { REACTIONS, type ReactionType } from '@cim/shared';
import { cn } from '../../lib/cn';

export interface ReactionBarProps {
  counts: Record<ReactionType, number>;
  /** The viewer's current reaction, or null when they have not reacted. */
  selected: ReactionType | null;
  onToggle: (reaction: ReactionType) => void;
  /** Disables the buttons (e.g. while saving). */
  disabled?: boolean;
}

const ICONS: Record<ReactionType, React.ReactNode> = {
  like: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 17V8.5l3.2-5.4c1.1 0 2 .9 2 2V7h3.9c.9 0 1.6.8 1.4 1.7l-1.2 6.6c-.1.8-.8 1.7-1.7 1.7H7Zm0 0H3.5V8.5H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  dislike: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 3v8.5l3.2 5.4c1.1 0 2-.9 2-2V13h3.9c.9 0 1.6-.8 1.4-1.7l-1.2-6.6C16.1 3.9 15.4 3 14.5 3H7Zm0 0H3.5v8.5H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  unsure: (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7.4 7.3a2.7 2.7 0 1 1 3.9 2.4c-.8.4-1.3 1-1.3 1.9v.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="15.4" r="1" fill="currentColor" />
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

const activeTone: Record<ReactionType, string> = {
  like: 'bg-accent-50 text-accent-700 border-accent-100',
  dislike: 'bg-danger-bg text-danger-fg border-danger-border',
  unsure: 'bg-warning-bg text-warning-fg border-warning-border',
};

const idleTone = 'text-ink-muted border-transparent hover:bg-surface-2 hover:text-ink';

/**
 * Facebook-style reaction row: Like / Dislike / Don't know — shown as icons
 * with their counts (no visible text labels; screen readers get the name from
 * aria-label). Exactly one can be active; tapping the active one again removes
 * the reaction.
 */
export function ReactionBar({ counts, selected, onToggle, disabled = false }: ReactionBarProps) {
  return (
    <div className="grid grid-cols-3 gap-1 border-t border-line pt-1">
      {REACTIONS.map((reaction) => {
        const active = selected === reaction.id;
        const count = counts[reaction.id];
        return (
          <button
            key={reaction.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-label={count > 0 ? `${reaction.label}, ${count}` : reaction.label}
            onClick={() => onToggle(reaction.id)}
            className={cn(
              'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-sm font-medium transition-colors',
              active ? activeTone[reaction.id] : idleTone,
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {ICONS[reaction.id]}
            {count > 0 && (
              <span className="font-semibold" aria-hidden="true">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
