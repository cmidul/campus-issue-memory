import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('offers a skip link to the main content', () => {
    render(<Header onReportClick={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    );
  });

  it('toggles between light and dark theme', async () => {
    const user = userEvent.setup();
    render(<Header onReportClick={vi.fn()} />);

    const toggle = screen.getByRole('button', { name: 'Switch to dark theme' });
    await user.click(toggle);

    expect(document.documentElement).toHaveClass('dark');
    // The label flips so the next action is clear.
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    render(<Header onReportClick={vi.fn()} />);

    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.getByRole('navigation', { name: 'Mobile' })).not.toBeVisible();
  });

  it('reports the report button to the parent', async () => {
    const user = userEvent.setup();
    const onReportClick = vi.fn();
    render(<Header onReportClick={onReportClick} />);

    // Both the compact and full-size variants share the same accessible name.
    const [first] = screen.getAllByRole('button', { name: 'Report a problem' });
    await user.click(first);

    expect(onReportClick).toHaveBeenCalledTimes(1);
  });
});
