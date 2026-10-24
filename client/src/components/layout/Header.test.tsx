import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../auth/AuthProvider';
import { Header, type HeaderProps } from './Header';

/** Header consumes auth state, so every render goes through the provider. */
function renderHeader(props: Partial<HeaderProps> = {}) {
  return render(
    <AuthProvider>
      <Header onReportClick={vi.fn()} onSignInClick={vi.fn()} {...props} />
    </AuthProvider>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('offers a skip link to the main content', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    );
  });

  it('toggles between light and dark theme', async () => {
    const user = userEvent.setup();
    renderHeader();

    const toggle = screen.getByRole('button', { name: 'Switch to dark theme' });
    await user.click(toggle);

    expect(document.documentElement).toHaveClass('dark');
    // The label flips so the next action is clear.
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    renderHeader();

    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    // The menu is hidden again, so include hidden elements in the query.
    expect(screen.getByRole('navigation', { name: 'Mobile', hidden: true })).not.toBeVisible();
  });

  it('reports the report button to the parent', async () => {
    const user = userEvent.setup();
    const onReportClick = vi.fn();
    renderHeader({ onReportClick });

    // One responsive button; its accessible name is stable at every width.
    await user.click(screen.getByRole('button', { name: 'Report a problem' }));

    expect(onReportClick).toHaveBeenCalledTimes(1);
  });

  it('renders exactly one report button with responsive labels', () => {
    renderHeader();

    // Regression: a second full-size button used to render below the `sm`
    // breakpoint because `hidden` lost to Button's base `inline-flex`. The
    // single button must carry both a compact and a full label, each gated by
    // a breakpoint on a plain element (not on Button itself).
    const buttons = screen.getAllByRole('button', { name: 'Report a problem' });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('Report a problem');
  });

  it('offers a sign-in button to visitors and reports the click', async () => {
    const user = userEvent.setup();
    const onSignInClick = vi.fn();
    renderHeader({ onSignInClick });

    // Resolves once the session lookup settles (no server → visitor).
    const signIn = await screen.findByRole('button', { name: 'Sign in' });
    await user.click(signIn);

    expect(onSignInClick).toHaveBeenCalledTimes(1);
  });

  it('shows the account chip with role and signs the demo user out', async () => {
    const user = userEvent.setup();
    // Seed the persisted demo session; the provider restores it on mount.
    window.localStorage.setItem('cim.demo-session', 'true');
    renderHeader();

    // Signed in via the demo account (no server session in jsdom).
    const chip = await screen.findByRole('button', { name: 'Account menu for Alex Kim' });
    await user.click(chip);

    expect(screen.getByText('alex.kim@university.edu')).toBeInTheDocument();
    expect(screen.getByText('Campus staff')).toBeInTheDocument();
    expect(screen.getByText('demo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(window.localStorage.getItem('cim.demo-session')).toBeNull();
  });
});
