import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { useFieldContext } from './FormField';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Native <select> (platform menu on mobile) with a custom chevron.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...rest },
  ref,
) {
  const field = useFieldContext();

  return (
    <div className="relative">
      <select
        {...rest}
        ref={ref}
        id={rest.id ?? field?.id}
        aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
        aria-invalid={rest['aria-invalid'] ?? (field?.invalid || undefined)}
        className={cn(
          'block w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-3.5 pr-10 text-base text-ink shadow-sm transition',
          'focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25',
          'disabled:cursor-not-allowed disabled:opacity-60',
          field?.invalid && 'border-danger focus:border-danger focus:ring-danger/25',
          className,
        )}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      >
        <path
          d="m5 7.5 5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});
