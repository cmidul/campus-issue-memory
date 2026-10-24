import { cn } from '../../lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <span
      role="status"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClass,
        className,
      )}
    >
      <span className="sr-only">Loading…</span>
    </span>
  );
}
