import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { useFieldContext } from './FormField';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, rows = 4, ...rest },
  ref,
) {
  const field = useFieldContext();

  return (
    <textarea
      {...rest}
      ref={ref}
      rows={rows}
      id={rest.id ?? field?.id}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      aria-invalid={rest['aria-invalid'] ?? (field?.invalid || undefined)}
      className={cn(
        'block w-full min-h-28 resize-y rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-ink shadow-sm transition placeholder:text-ink-muted',
        'focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25',
        'disabled:cursor-not-allowed disabled:opacity-60',
        field?.invalid && 'border-danger focus:border-danger focus:ring-danger/25',
        className,
      )}
    />
  );
});
