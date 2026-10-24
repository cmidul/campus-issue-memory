import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the welcome prompt', async () => {
    render(<App />);
    // The create-a-post prompt greets the signed-in demo viewer.
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

  it('opens the report dialog from the create-a-post prompt', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/Seen a problem on campus, Alex\?/);

    await user.click(screen.getByRole('button', { name: /Seen a problem on campus/ }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
