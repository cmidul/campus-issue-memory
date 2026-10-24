export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6">
        <p className="text-sm font-medium text-ink">Campus Issue Memory</p>
        <p className="mt-1 max-w-prose text-sm text-ink-muted">
          Open-source campus issue reporting. This demo shows synthetic sample data only — no real
          student reports, names, or photos are used.
        </p>
        <p className="mt-4 text-xs text-ink-muted">
          MIT licensed. Built for universities, with accessibility in mind.
        </p>
      </div>
    </footer>
  );
}
