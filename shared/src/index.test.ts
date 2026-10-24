import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  CATEGORY_IDS,
  REACTIONS,
  REPORT_STATUSES,
  REPORT_STATUS_META,
  SEVERITIES,
  USER_ROLES,
  getCategoryMeta,
} from './index';

describe('report status metadata', () => {
  it('defines metadata for every status', () => {
    for (const status of REPORT_STATUSES) {
      const meta = REPORT_STATUS_META[status];
      expect(meta, `missing meta for ${status}`).toBeDefined();
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });

  it('uses plain-language labels (no jargon)', () => {
    for (const status of REPORT_STATUSES) {
      const { label } = REPORT_STATUS_META[status];
      expect(label).not.toMatch(/embedding|confidence|threshold|provenance/i);
    }
  });
});

describe('categories', () => {
  it('provides a label and an example for every category', () => {
    expect(CATEGORIES.length).toBe(10);
    for (const category of CATEGORIES) {
      expect(category.label.length).toBeGreaterThan(0);
      expect(category.example.length).toBeGreaterThan(0);
    }
  });

  it('has unique ids', () => {
    expect(new Set(CATEGORY_IDS).size).toBe(CATEGORY_IDS.length);
  });

  it('resolves a category by id', () => {
    expect(getCategoryMeta('water').label).toBe('Water & plumbing');
    expect(() => getCategoryMeta('nope' as never)).toThrow();
  });
});

describe('roles, severities and reactions', () => {
  it('covers the three required roles', () => {
    expect([...USER_ROLES]).toEqual(['visitor', 'user', 'admin']);
  });

  it('orders severities from low to high', () => {
    expect(SEVERITIES.map((severity) => severity.id)).toEqual(['low', 'medium', 'high']);
  });

  it('offers the three required reactions', () => {
    expect(REACTIONS.map((reaction) => reaction.id)).toEqual(['like', 'dislike', 'unsure']);
    for (const reaction of REACTIONS) {
      expect(reaction.label.length).toBeGreaterThan(0);
      expect(reaction.description.length).toBeGreaterThan(0);
    }
  });
});
