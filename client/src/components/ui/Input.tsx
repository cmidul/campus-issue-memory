import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { useFieldContext } from './FormField';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Text input sized at 16px so iOS Safari does not zoom the page on focus.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...rest },
  ref,
) {
  const field = useFieldContext();

  return (
    <input
      {...rest}
      ref={ref}
      type={type}
      id={rest.id ?? field?.id}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      aria-invalid={rest['aria-invalid'] ?? (field?.invalid || undefined)}
      className={cn(
        'block w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-ink shadow-sm transition placeholder:text-ink-muted',
        'focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25',
        'disabled:cursor-not-allowed disabled:opacity-60',
        field?.invalid && 'border-danger focus:border-danger focus:ring-danger/25',
        className,
      )}
    />
  );
});
