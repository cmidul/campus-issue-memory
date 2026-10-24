import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { REPORT_STATUSES, REPORT_STATUS_META } from '@cim/shared';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('shows the plain-language label for each status', () => {
    for (const status of REPORT_STATUSES) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(REPORT_STATUS_META[status].label)).toBeInTheDocument();
      unmount();
    }
  });

  it('uses the shared wording rather than raw status ids', () => {
    render(<StatusBadge status="under_review" />);
    expect(screen.getByText('Under review')).toBeInTheDocument();
    expect(screen.queryByText('under_review')).not.toBeInTheDocument();
  });
});
