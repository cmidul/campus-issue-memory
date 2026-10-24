import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the welcome prompt for a visitor', async () => {
    render(<App />);
    // Anonymous visitors get a generic prompt; no name is assumed.
    expect(await screen.findByText('Seen a problem on campus?')).toBeInTheDocument();
  });

  it('greets the signed-in demo user by name', async () => {
    window.localStorage.setItem('cim.demo-session', 'true');
    render(<App />);

    expect(await screen.findByText(/Seen a problem on campus, Alex\?/)).toBeInTheDocument();
  });

  it('shows a loading state before the report feed', () => {
    render(<App />);
    expect(screen.getByRole('status', { name: 'Loading reports' })).toBeInTheDocument();
  });

  it('lists demo posts after loading', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Broken chair in Lecture Hall B' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/posts shown \(demo data\)/)).toBeInTheDocument();
  });

  it('shows the author of each post, including anonymous ones', async () => {
    render(<App />);

    expect(await screen.findByText('Priya S.', { selector: 'header p' })).toBeInTheDocument();
    // Anonymous posts show the label instead of a real name.
    expect(screen.getAllByText('Anonymous student').length).toBeGreaterThan(0);
  });

  it('filters posts with the search box', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: 'Broken chair in Lecture Hall B' });

    await user.type(screen.getByLabelText('Search reports'), 'library');

    expect(screen.getByText(/1 post shown \(demo data\)/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Wi-Fi keeps dropping in the library reading room' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Broken chair in Lecture Hall B' }),
    ).not.toBeInTheDocument();
  });

  it('shows an empty state with a way back when nothing matches', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: 'Broken chair in Lecture Hall B' });

    await user.type(screen.getByLabelText('Search reports'), 'zzzzzz');

    expect(screen.getByText('No posts match your search')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(
      screen.getByRole('heading', { name: 'Broken chair in Lecture Hall B' }),
    ).toBeInTheDocument();
  });

  it('asks a visitor to sign in before composing, then resumes the report', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Seen a problem on campus?');

    // The visitor clicks the prompt → sign-in dialog, not the composer.
    await user.click(screen.getByRole('button', { name: /Seen a problem on campus/ }));

    const signInDialog = await screen.findByRole('dialog');
    expect(signInDialog).toHaveTextContent('Sign in to report and follow issues');
    expect(screen.queryByRole('button', { name: 'Submit report' })).not.toBeInTheDocument();

    // Demo sign-in completes the original intent: the composer opens now.
    await user.click(screen.getByRole('button', { name: /Explore as Alex/ }));

    expect(await screen.findByRole('button', { name: 'Submit report' })).toBeInTheDocument();
    // Signed in: the account chip replaced the Sign in button.
    expect(
      await screen.findByRole('button', { name: 'Account menu for Alex Kim' }),
    ).toBeInTheDocument();
  });

  it('opens the report dialog directly for a signed-in user', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('cim.demo-session', 'true');
    render(<App />);
    await screen.findByText(/Seen a problem on campus, Alex\?/);

    await user.click(screen.getByRole('button', { name: /Seen a problem on campus/ }));

    expect(await screen.findByRole('button', { name: 'Submit report' })).toBeInTheDocument();
  });

  it('signs the demo user out from the account menu', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('cim.demo-session', 'true');
    render(<App />);
    await screen.findByText(/Seen a problem on campus, Alex\?/);

    await user.click(screen.getByRole('button', { name: 'Account menu for Alex Kim' }));
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    // Back to the visitor prompt, and the persisted session is gone.
    expect(await screen.findByText('Seen a problem on campus?')).toBeInTheDocument();
    expect(window.localStorage.getItem('cim.demo-session')).toBeNull();
  });
});
