import { cn } from '../../lib/cn';

export interface AvatarProps {
  /** Full display name; initials are drawn from its words. */
  name: string;
  /** Renders the generic "anonymous" glyph instead of initials. */
  anonymous?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Circular author avatar. Anonymous authors get a neutral glyph so a report
 * never leaks who filed it.
 */
export function Avatar({ name, anonymous = false, size = 'md', className }: AvatarProps) {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
        anonymous
          ? 'bg-surface-2 text-ink-muted ring-1 ring-inset ring-line'
          : 'bg-accent-100 text-accent-700',
        sizeClasses,
        className,
      )}
    >
      {anonymous ? (
        <svg viewBox="0 0 20 20" fill="none" className="h-1/2 w-1/2">
          <circle cx="10" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M4 16.5c.9-2.6 3.1-4 6-4s5.1 1.4 6 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
