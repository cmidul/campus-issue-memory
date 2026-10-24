import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './Toast';

/** Harness so the tests can trigger a toast from outside the provider. */
function ToastTrigger() {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast('Report submitted.', 'success')}>
      Send
    </button>
  );
}

describe('Toast', () => {
  it('shows a message announced politely', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    const message = await screen.findByText('Report submitted.');
    // The live region wrapper is the polite announcer.
    expect(message.closest('[aria-live="polite"]')).not.toBeNull();
  });

  it('can be dismissed manually', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Report submitted.');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));

    expect(screen.queryByText('Report submitted.')).not.toBeInTheDocument();
  });

  it('disappears on its own after a few seconds', async () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(screen.getByText('Report submitted.')).toBeInTheDocument();

      // The auto-dismiss timer triggers a state update, so run it inside act.
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText('Report submitted.')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('throws a helpful error when used outside the provider', () => {
    // Suppress React's error logging for this intentional failure.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ToastTrigger />)).toThrow('useToast must be used within');
    consoleError.mockRestore();
  });
});
