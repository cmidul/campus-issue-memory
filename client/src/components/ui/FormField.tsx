import { createContext, useContext, useId, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Input-family components read the nearest field to wire up a11y attributes. */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FormFieldProps {
  label: string;
  /** Optional helper text shown under the control. */
  hint?: string;
  /** Error message; when present the field is marked invalid. */
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + hint/error wrapper. The control (Input, Textarea, Select)
 * picks up the generated id and aria attributes automatically via context.
 */
export function FormField({
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);

  const describedBy = [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(' ');

  return (
    <FieldContext.Provider value={{ id, describedBy: describedBy || undefined, invalid }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="ml-0.5 text-danger">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>
        {children}
        {hint && !invalid && (
          <p id={hintId} className="text-xs text-ink-muted">
            {hint}
          </p>
        )}
        {invalid && (
          <p id={errorId} className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
