import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import App from '../App';

/**
 * jsdom does not do real layout/paint, so colour-contrast cannot be evaluated
 * here. Contrast is checked manually in the real browser instead (documented
 * in the milestone report). Every other axe rule stays enabled.
 */
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
};

async function runAxe(container: HTMLElement): Promise<axe.Result[]> {
  const results = await axe.run(container, AXE_OPTIONS);
  return results.violations;
}

function describeViolations(violations: axe.Result[]): string {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes.map((node) => `  - ${node.html}`).join('\n'),
    )
    .join('\n');
}

describe('accessibility', () => {
  it('has no axe violations on the main page', async () => {
    const { container } = render(<App />);
    // Wait for the loading skeletons to be replaced by real content.
    await screen.findByRole('heading', { level: 1 });
    await screen.findByText('Broken chair in Lecture Hall B');

    const violations = await runAxe(container);

    expect(describeViolations(violations)).toBe('');
  });

  it('has no axe violations with the report dialog open', async () => {
    const user = userEvent.setup();
    // Signed-in users reach the composer; visitors stop at the sign-in dialog.
    window.localStorage.setItem('cim.demo-session', 'true');
    render(<App />);
    await screen.findByRole('heading', { level: 1 });
    await screen.findByText('Broken chair in Lecture Hall B');

    const [bannerButton] = screen.getAllByRole('button', { name: 'Report a problem' });
    await user.click(bannerButton);
    await screen.findByRole('dialog');

    // The dialog is portaled to document.body, so scan the whole document.
    const violations = await runAxe(document.body);

    expect(describeViolations(violations)).toBe('');
  });
});
