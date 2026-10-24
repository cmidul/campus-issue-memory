/**
 * Tiny class-name joiner: `cn('a', condition && 'b')` -> `"a b"`.
 * Keeps component class handling readable without an extra dependency.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
