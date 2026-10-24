import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

function renderDialog(onClose = vi.fn()) {
  render(
    <Dialog
      open
      onClose={onClose}
      title="Report a problem"
      description="A photo helps."
      footer={<button type="button">Submit report</button>}
    >
      <p>Dialog body content</p>
    </Dialog>,
  );
  return { onClose };
}

describe('Dialog', () => {
  it('is a labelled modal dialog', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Report a problem');
    expect(dialog).toHaveAccessibleDescription('A photo helps.');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders nothing while closed', () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="Report a problem">
        <p>Body</p>
      </Dialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus into the dialog when it opens', () => {
    renderDialog();

    // First focusable element is the close button.
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    const dialog = screen.getByRole('dialog');
    // The backdrop is the portal container directly above the panel.
    const backdrop = dialog.parentElement;
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as HTMLElement);

    expect(onClose).toHaveBeenCalled();
  });

  it('keeps Tab focus inside the dialog', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Tab through every focusable element; focus should never leave the panel.
    const dialog = screen.getByRole('dialog');
    const focusableCount = dialog.querySelectorAll(
      'button, [href], input, select, textarea',
    ).length;

    for (let index = 0; index < focusableCount + 2; index += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });
});
