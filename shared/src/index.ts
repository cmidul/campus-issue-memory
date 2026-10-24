/**
 * Shared types and constants for Campus Issue Memory.
 *
 * This package is the single source of truth for domain vocabulary used by both
 * the client and the server: report statuses, user roles, categories, severity
 * levels, and reactions.
 */

/* -------------------------------------------------------------------------- */
/* Roles                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * - `visitor`: not signed in; can only browse public reports.
 * - `user`: verified university account (Google Workspace e-mail matched
 *   against `UNIVERSITY_EMAIL_DOMAIN`).
 * - `admin`: moderator / authorized staff member.
 */
export type UserRole = 'visitor' | 'user' | 'admin';

export const USER_ROLES: readonly UserRole[] = ['visitor', 'user', 'admin'] as const;

/* -------------------------------------------------------------------------- */
/* Report status                                                              */
/* -------------------------------------------------------------------------- */

export type ReportStatus =
  'submitted' | 'under_review' | 'verified' | 'in_progress' | 'resolved' | 'reopened' | 'rejected';

export const REPORT_STATUSES: readonly ReportStatus[] = [
  'submitted',
  'under_review',
  'verified',
  'in_progress',
  'resolved',
  'reopened',
  'rejected',
] as const;

/**
 * Visual tone for a status badge. Kept UI-framework agnostic on purpose: the
 * client maps each tone to concrete classes so `shared` stays dependency free.
 */
export type StatusTone = 'neutral' | 'info' | 'progress' | 'success' | 'warning' | 'danger';

export interface StatusMeta {
  /** Plain-language label shown to users. */
  label: string;
  /** One short sentence explaining what this status means. */
  description: string;
  tone: StatusTone;
}

export const REPORT_STATUS_META: Record<ReportStatus, StatusMeta> = {
  submitted: {
    label: 'Submitted',
    description: 'Your report has been received and is waiting for a first review.',
    tone: 'neutral',
  },
  under_review: {
    label: 'Under review',
    description: 'A moderator is checking the details of this report.',
    tone: 'info',
  },
  verified: {
    label: 'Verified',
    description: 'A moderator confirmed that this is a real campus issue.',
    tone: 'info',
  },
  in_progress: {
    label: 'In progress',
    description: 'Staff have started working on this issue.',
    tone: 'progress',
  },
  resolved: {
    label: 'Resolved',
    description: 'The issue was marked as fixed. You can still report it again if it returns.',
    tone: 'success',
  },
  reopened: {
    label: 'Reopened',
    description: 'The issue came back after being marked as fixed.',
    tone: 'warning',
  },
  rejected: {
    label: 'Rejected',
    description: 'This report was not accepted. The reason is shown in its history.',
    tone: 'danger',
  },
};

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export type CategoryId =
  | 'classroom'
  | 'electrical'
  | 'internet'
  | 'water'
  | 'cleanliness'
  | 'paths'
  | 'accessibility'
  | 'safety'
  | 'lab_library'
  | 'other';

export interface CategoryMeta {
  id: CategoryId;
  /** Plain-language label. */
  label: string;
  /** A short example that helps non-technical users pick the right one. */
  example: string;
}

export const CATEGORIES: readonly CategoryMeta[] = [
  {
    id: 'classroom',
    label: 'Classroom equipment & furniture',
    example: 'broken chair, desk, projector',
  },
  { id: 'electrical', label: 'Electrical & lighting', example: 'dark corridor, dead socket' },
  { id: 'internet', label: 'Internet & network', example: 'Wi-Fi keeps dropping' },
  { id: 'water', label: 'Water & plumbing', example: 'leaking tap, no water' },
  { id: 'cleanliness', label: 'Cleanliness & waste', example: 'overflowing bin, spill' },
  { id: 'paths', label: 'Damaged paths & infrastructure', example: 'cracked floor, broken tile' },
  { id: 'accessibility', label: 'Accessibility', example: 'blocked ramp, no lift access' },
  { id: 'safety', label: 'Safety hazards', example: 'exposed wire, loose railing' },
  {
    id: 'lab_library',
    label: 'Laboratory & library',
    example: 'broken microscope, jammed printer',
  },
  { id: 'other', label: 'Other', example: 'anything that does not fit above' },
] as const;

export const CATEGORY_IDS: readonly CategoryId[] = CATEGORIES.map((category) => category.id);

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  const found = CATEGORIES.find((category) => category.id === id);
  if (!found) {
    throw new Error(`Unknown category id: ${id}`);
  }
  return found;
}

/* -------------------------------------------------------------------------- */
/* Severity                                                                   */
/* -------------------------------------------------------------------------- */

export type Severity = 'low' | 'medium' | 'high';

export interface SeverityMeta {
  id: Severity;
  label: string;
  description: string;
}

export const SEVERITIES: readonly SeverityMeta[] = [
  { id: 'low', label: 'Low', description: 'Annoying, but people can keep working around it.' },
  { id: 'medium', label: 'Medium', description: 'It disrupts classes, study, or daily use.' },
  { id: 'high', label: 'High', description: 'It is unsafe or blocks accessibility right now.' },
] as const;

export const DEFAULT_SEVERITY: Severity = 'medium';

/* -------------------------------------------------------------------------- */
/* Reactions (verified users only)                                            */
/* -------------------------------------------------------------------------- */

/**
 * Facebook-style reactions. One reaction per user per report; choosing
 * another one replaces the previous choice, and tapping again removes it.
 */
export type ReactionType = 'like' | 'dislike' | 'unsure';

export interface ReactionMeta {
  id: ReactionType;
  /** Button label shown under a report. */
  label: string;
  /** One short sentence explaining what picking this reaction means. */
  description: string;
}

export const REACTIONS: readonly ReactionMeta[] = [
  { id: 'like', label: 'Like', description: 'You agree this is a real problem.' },
  { id: 'dislike', label: 'Dislike', description: 'You do not think this is a problem.' },
  { id: 'unsure', label: "Don't know", description: 'You are not sure about this report.' },
] as const;

/* -------------------------------------------------------------------------- */
/* Comments                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A comment on a report. Authorship and moderation arrive with the backend
 * milestones; the demo client renders synthetic comments only.
 */
export interface Comment {
  id: string;
  authorName: string;
  text: string;
  /** Plain-language timestamp for the demo ("2 hours ago"). */
  createdAt: string;
}

/**
 * Display name for reports posted anonymously. The author's real account is
 * still known to the server for moderation — only the public label changes.
 */
export const ANONYMOUS_AUTHOR_LABEL = 'Anonymous student';

/* -------------------------------------------------------------------------- */
/* Validation limits (mirrored by server-side validation)                     */
/* -------------------------------------------------------------------------- */

export const LIMITS = {
  titleMin: 8,
  titleMax: 140,
  descriptionMin: 10,
  descriptionMax: 4000,
  locationMax: 160,
  photoMaxBytes: 8 * 1024 * 1024,
  photoAcceptedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  /**
   * Short video clips (e.g. a flickering light that only shows on camera).
   * Kept small so free-tier AI services stay usable: the server samples a
   * handful of frames and sends only those to the AI, never the whole file.
   */
  videoMaxBytes: 50 * 1024 * 1024,
  videoMaxSeconds: 60,
  videoAcceptedTypes: ['video/mp4', 'video/webm'] as const,
} as const;
