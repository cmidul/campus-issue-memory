import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { DEMO_AUTH_USER, useAuth } from '../../auth/AuthProvider';

export interface SignInDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * Called after a successful sign-in (demo or when returning from Google).
   * Used to resume an interrupted action, e.g. opening the report composer.
   */
  onSignedIn?: () => void;
}

/**
 * Sign-in options: real Google OAuth when the server has keys, and the
 * built-in demo account so the app is fully usable with zero configuration.
 */
export function SignInDialog({ open, onClose, onSignedIn }: SignInDialogProps) {
  const { googleEnabled, signInDemo } = useAuth();

  function handleDemoSignIn() {
    signInDemo();
    onClose();
    onSignedIn?.();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Sign in to report and follow issues"
      description="Use your university Google account. Only campus addresses can post — that keeps reports accountable."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {googleEnabled ? (
          <a
            href="/api/auth/google"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700"
          >
            {/* Official "G" mark, four-colour, used per Google's badge rules. */}
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.6c-.1 1.1-.9 2.8-2.5 3.9l3.8 2.9c2.3-2.1 3.6-5.2 3.6-8.6Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.3 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5l-3.9 3C3.3 21.3 7.3 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4l-3.9-3C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l3.9-3Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.7c2.2 0 3.7.9 4.5 1.7l3.3-3.2C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.6l3.9 3c.9-2.9 3.6-4.9 6.7-4.9Z"
              />
            </svg>
            Continue with Google
          </a>
        ) : (
          <div className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-muted">
            <p className="font-medium text-ink">Google sign-in is off in this demo.</p>
            <p className="mt-1">
              The server needs a Google OAuth client (<code className="text-xs">.env</code>:
              GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) to enable it. Meanwhile you can explore
              everything with the demo account below.
            </p>
          </div>
        )}

        <Button variant="secondary" onClick={handleDemoSignIn}>
          Explore as {DEMO_AUTH_USER.name.split(' ')[0]} (demo account)
        </Button>

        <p className="text-center text-xs text-ink-muted">
          Demo mode uses synthetic sample reports — no real student data.
        </p>
      </div>
    </Dialog>
  );
}
