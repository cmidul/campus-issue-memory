import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

async function renderApp() {
  render(<App />);
  // The demo page briefly shows skeletons before the feed appears.
  return screen.findByRole('heading', { level: 1 });
}

describe('App', () => {
  it('renders the welcome banner', async () => {
    const heading = await renderApp();
    expect(heading).toHaveTextContent('See a problem on campus? Report it once.');
  });

  it('shows a loading state before the report feed', () => {
    render(<App />);
    expect(screen.getByRole('status', { name: 'Loading reports' })).toBeInTheDocument();
  });

  it('lists demo reports after loading', async () => {
    await renderApp();

    expect(await screen.findByText('Broken chair in Lecture Hall B')).toBeInTheDocument();
    expect(screen.getByText(/reports shown \(demo data\)/)).toBeInTheDocument();
  });

  it('filters reports with the search box', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByText('Broken chair in Lecture Hall B');

    await user.type(screen.getByLabelText('Search reports'), 'library');

    expect(screen.getByText(/1 report shown \(demo data\)/)).toBeInTheDocument();
    expect(
      screen.getByText('Wi-Fi keeps dropping in the library reading room'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Broken chair in Lecture Hall B')).not.toBeInTheDocument();
  });

  it('shows an empty state with a way back when nothing matches', async () => {
    const user = userEvent.setup();
    await renderApp();
    await screen.findByText('Broken chair in Lecture Hall B');

    await user.type(screen.getByLabelText('Search reports'), 'zzzzzz');

    expect(screen.getByText('No reports match your search')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByText('Broken chair in Lecture Hall B')).toBeInTheDocument();
  });

  it('opens the report dialog from the banner', async () => {
    const user = userEvent.setup();
    await renderApp();

    const [bannerButton] = screen.getAllByRole('button', { name: 'Report a problem' });
    await user.click(bannerButton);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
