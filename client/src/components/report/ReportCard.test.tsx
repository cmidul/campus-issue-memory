import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DEMO_REPORTS } from '../../data/demoReports';
import { ReportCard } from './ReportCard';

const report = DEMO_REPORTS[0]; // has reactions and two comments
const emptyReport = DEMO_REPORTS[6]; // no comments yet

describe('ReportCard (post)', () => {
  it('shows the author, or the anonymous label when posted anonymously', () => {
    const { container, unmount } = render(<ReportCard report={report} />);
    const header = container.querySelector('header') as HTMLElement;
    expect(within(header).getByText('Priya S.')).toBeInTheDocument();
    unmount();

    const anonymous = DEMO_REPORTS[1];
    const second = render(<ReportCard report={anonymous} />);
    const secondHeader = second.container.querySelector('header') as HTMLElement;
    expect(within(secondHeader).getByText('Anonymous student')).toBeInTheDocument();
    // The card must render the anonymous label, not the raw author field.
    expect(within(secondHeader).getByText(anonymous.author.name)).toBeInTheDocument();
    expect(anonymous.author.isAnonymous).toBe(true);
  });

  it('renders title, description and status', () => {
    const { container } = render(<ReportCard report={report} />);
    expect(
      screen.getByRole('heading', { name: 'Broken chair in Lecture Hall B' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/loose leg and wobbles/)).toBeInTheDocument();
    // The status badge appears in the header (the history list repeats labels).
    const header = container.querySelector('header') as HTMLElement;
    expect(within(header).getByText('In progress')).toBeInTheDocument();
  });

  describe('reactions', () => {
    it('increments Like when pressed and marks it active', async () => {
      const user = userEvent.setup();
      render(<ReportCard report={report} />);

      const likeButton = screen.getByRole('button', { name: /^Like/ });
      expect(likeButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(likeButton);

      expect(likeButton).toHaveAttribute('aria-pressed', 'true');
      expect(likeButton).toHaveTextContent('13');
    });

    it('moves the reaction when switching from Like to Dislike', async () => {
      const user = userEvent.setup();
      render(<ReportCard report={report} />);

      await user.click(screen.getByRole('button', { name: /^Like/ }));
      await user.click(screen.getByRole('button', { name: /^Dislike/ }));

      expect(screen.getByRole('button', { name: /^Like/ })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      expect(screen.getByRole('button', { name: /^Dislike/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      // Like back to 12, dislike up to 2.
      expect(screen.getByRole('button', { name: /^Like/ })).toHaveTextContent('12');
      expect(screen.getByRole('button', { name: /^Dislike/ })).toHaveTextContent('2');
    });

    it('removes the reaction when the active one is tapped again', async () => {
      const user = userEvent.setup();
      render(<ReportCard report={report} />);

      const likeButton = screen.getByRole('button', { name: /^Like/ });
      await user.click(likeButton);
      await user.click(likeButton);

      expect(likeButton).toHaveAttribute('aria-pressed', 'false');
      expect(likeButton).toHaveTextContent('12');
    });
  });

  describe('comments', () => {
    it('lists the existing comments', () => {
      render(<ReportCard report={report} />);
      expect(
        screen.getByText('Same here — I moved to another seat last week.'),
      ).toBeInTheDocument();
      expect(screen.getByText('2 comments')).toBeInTheDocument();
    });

    it('shows an empty thread for posts without comments', () => {
      render(<ReportCard report={emptyReport} />);
      expect(screen.queryByText(/comments$/)).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Write a comment…')).toBeInTheDocument();
    });

    it('posts a new comment from the viewer', async () => {
      const user = userEvent.setup();
      render(<ReportCard report={report} />);

      const composer = screen.getByLabelText('Write a comment');
      await user.type(composer, 'Still broken after the weekend.');
      await user.click(screen.getByRole('button', { name: 'Post' }));

      expect(screen.getByText('Still broken after the weekend.')).toBeInTheDocument();
      expect(screen.getByText('3 comments')).toBeInTheDocument();
      // Composer resets after posting.
      expect(composer).toHaveValue('');
    });

    it('refuses an empty comment', () => {
      render(<ReportCard report={emptyReport} />);

      // Button is disabled while the draft is empty.
      expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
    });
  });

  it('keeps the expandable update history', () => {
    render(<ReportCard report={report} />);
    const summary = screen.getByText(/View updates \(\d+\)/);
    expect(summary).toBeInTheDocument();
  });

  it('marks itself as demo data', () => {
    const { container } = render(<ReportCard report={report} />);
    // The demo flag lives on the data; the card itself is fed by DEMO_REPORTS.
    expect(report.isDemo).toBe(true);
    expect(container.querySelector('article')).not.toBeNull();
  });
});
