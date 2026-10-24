import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField';
import { Input } from './Input';

describe('FormField', () => {
  it('associates the label with the control so clicking the label focuses it', () => {
    render(
      <FormField label="Where is it?">
        <Input />
      </FormField>,
    );

    expect(screen.getByLabelText('Where is it?')).toBeInTheDocument();
  });

  it('shows hint text and links it to the control', () => {
    render(
      <FormField label="Add a photo" hint="JPG, PNG, or WebP — up to 8 MB.">
        <Input />
      </FormField>,
    );

    const input = screen.getByLabelText('Add a photo');
    const hint = screen.getByText('JPG, PNG, or WebP — up to 8 MB.');
    expect(input).toHaveAttribute('aria-describedby', hint.id);
  });

  it('marks the control invalid and describes it with the error message', () => {
    render(
      <FormField label="Describe the problem" error="Please add a few more words.">
        <Input />
      </FormField>,
    );

    const input = screen.getByLabelText('Describe the problem');
    const error = screen.getByText('Please add a few more words.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  it('announces required fields to screen readers', () => {
    render(
      <FormField label="Where is it?" required>
        <Input />
      </FormField>,
    );

    // The visual asterisk is aria-hidden; screen readers hear "(required)".
    expect(screen.getByLabelText(/Where is it\?.*\(required\)/)).toBeInTheDocument();
  });
});
