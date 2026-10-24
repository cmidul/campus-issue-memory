import { CATEGORIES, type CategoryId, type ReportStatus, type Severity } from '@cim/shared';

export interface DemoHistoryEntry {
  status: ReportStatus;
  date: string;
  note: string;
}

export interface DemoReport {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  location: string;
  status: ReportStatus;
  severity: Severity;
  image?: { src: string; alt: string };
  /** Present when a short video clip was attached instead of a photo. */
  videoLabel?: string;
  createdAt: string;
  history: DemoHistoryEntry[];
  /** Every demo record is marked so it can never be mistaken for a real report. */
  isDemo: true;
}

/**
 * Synthetic sample reports for the demo page. All names, places, and text are
 * invented; images are simple locally-drawn SVGs.
 */
export const DEMO_REPORTS: DemoReport[] = [
  {
    id: 'demo-1',
    title: 'Broken chair in Lecture Hall B',
    description:
      'The chair in the second row has a loose leg and wobbles a lot. It is not safe to sit on.',
    category: 'classroom',
    location: 'Lecture Hall B, second row',
    status: 'in_progress',
    severity: 'medium',
    image: {
      src: '/demo/broken-chair.svg',
      alt: 'Illustration of a classroom chair with a broken front leg',
    },
    createdAt: '2 days ago',
    history: [
      { status: 'submitted', date: '2 days ago', note: 'Reported by a student.' },
      { status: 'verified', date: '2 days ago', note: 'Confirmed by a moderator.' },
      { status: 'in_progress', date: '1 day ago', note: 'Facilities team notified.' },
    ],
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'Flickering light above the north stairwell',
    description: 'The ceiling light keeps flickering on and off. The stairwell is dark at night.',
    category: 'electrical',
    location: 'North stairwell, floors 2–3',
    status: 'verified',
    severity: 'high',
    image: {
      src: '/demo/dark-corridor.svg',
      alt: 'Illustration of a dark stairwell with a flickering ceiling light',
    },
    createdAt: '4 days ago',
    history: [
      { status: 'submitted', date: '4 days ago', note: 'Reported by a student.' },
      { status: 'verified', date: '3 days ago', note: 'Confirmed by a moderator.' },
    ],
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'Leaking tap in the second-floor washroom',
    description: 'The cold-water tap drips constantly, even when fully closed.',
    category: 'water',
    location: 'Main building, 2nd floor washroom',
    status: 'resolved',
    severity: 'low',
    image: {
      src: '/demo/leaking-tap.svg',
      alt: 'Illustration of a dripping tap over a sink',
    },
    createdAt: '1 week ago',
    history: [
      { status: 'submitted', date: '1 week ago', note: 'Reported by a student.' },
      { status: 'verified', date: '1 week ago', note: 'Confirmed by a moderator.' },
      { status: 'in_progress', date: '5 days ago', note: 'Plumber scheduled.' },
      { status: 'resolved', date: '3 days ago', note: 'Tap washer replaced.' },
    ],
    isDemo: true,
  },
  {
    id: 'demo-4',
    title: 'Wi-Fi keeps dropping in the library reading room',
    description:
      'The connection disconnects every few minutes on the quiet-study floor. Several students reported it.',
    category: 'internet',
    location: 'Library, quiet-study floor',
    status: 'reopened',
    severity: 'medium',
    image: {
      src: '/demo/no-wifi.svg',
      alt: 'Illustration of a laptop with a crossed-out Wi-Fi symbol',
    },
    createdAt: '2 weeks ago',
    history: [
      { status: 'submitted', date: '2 weeks ago', note: 'Reported by a student.' },
      { status: 'verified', date: '2 weeks ago', note: 'Confirmed by a moderator.' },
      { status: 'resolved', date: '10 days ago', note: 'Router restarted.' },
      { status: 'reopened', date: '6 days ago', note: 'Problem returned for several users.' },
    ],
    isDemo: true,
  },
  {
    id: 'demo-5',
    title: 'Blocked ramp entrance at the science block',
    description:
      'Boxes and a trolley are stored in front of the accessible ramp, so wheelchairs cannot pass.',
    category: 'accessibility',
    location: 'Science block, main entrance ramp',
    status: 'under_review',
    severity: 'high',
    videoLabel: 'Short clip of the blocked ramp',
    createdAt: '1 day ago',
    history: [
      { status: 'submitted', date: '1 day ago', note: 'Reported by a student.' },
      { status: 'under_review', date: '1 day ago', note: 'A moderator is checking the details.' },
    ],
    isDemo: true,
  },
  {
    id: 'demo-6',
    title: 'Cracked floor tile near the cafeteria',
    description: 'A floor tile is cracked and lifted, which is easy to trip over.',
    category: 'paths',
    location: 'Cafeteria entrance',
    status: 'rejected',
    severity: 'low',
    createdAt: '3 weeks ago',
    history: [
      { status: 'submitted', date: '3 weeks ago', note: 'Reported by a student.' },
      {
        status: 'rejected',
        date: '3 weeks ago',
        note: 'Already fixed in scheduled maintenance the same day.',
      },
    ],
    isDemo: true,
  },
  {
    id: 'demo-7',
    title: 'Overflowing bin in the corridor',
    description: 'The bin outside the computer lab has not been emptied for three days.',
    category: 'cleanliness',
    location: 'Computers lab corridor, floor 1',
    status: 'submitted',
    severity: 'low',
    createdAt: '6 hours ago',
    history: [{ status: 'submitted', date: '6 hours ago', note: 'Reported by a student.' }],
    isDemo: true,
  },
];

export const CATEGORY_LABELS: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
) as Record<CategoryId, string>;
