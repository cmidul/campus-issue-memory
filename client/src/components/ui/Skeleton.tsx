import { cn } from '../../lib/cn';

export interface SkeletonProps {
  className?: string;
}

/** A single shimmering placeholder block. Always hidden from screen readers. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-surface-2', className)} />
  );
}

/** Card-shaped loading placeholder used while reports are being fetched. */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-3 h-3 w-1/3" />
    </div>
  );
}
