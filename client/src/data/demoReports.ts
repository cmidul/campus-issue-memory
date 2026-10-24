import {
  ANONYMOUS_AUTHOR_LABEL,
  CATEGORIES,
  type Comment,
  type ReactionType,
  type ReportStatus,
  type Severity,
} from '@cim/shared';

export interface DemoHistoryEntry {
  status: ReportStatus;
  date: string;
  note: string;
}

export interface DemoReport {
  id: string;
  title: string;
  description: string;
  category: (typeof CATEGORIES)[number]['id'];
  location: string;
  status: ReportStatus;
  severity: Severity;
  /** Account that filed the report; `isAnonymous` hides it from other students. */
  author: { name: string; isAnonymous: boolean };
  image?: { src: string; alt: string };
  /** Present when a short video clip was attached instead of a photo. */
  videoLabel?: string;
  createdAt: string;
  history: DemoHistoryEntry[];
  /** Starting reaction counts; the viewer's own reaction is kept separately. */
  reactions: Record<ReactionType, number>;
  comments: Comment[];
  /** Every demo record is marked so it can never be mistaken for a real report. */
  isDemo: true;
}

/** The signed-in demo account used for posting, reacting, and commenting. */
export const DEMO_VIEWER = { name: 'Alex Kim' } as const;

/**
 * Synthetic sample reports for the demo page. All people, places, and text are
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
    author: { name: 'Priya S.', isAnonymous: false },
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
    reactions: { like: 12, dislike: 1, unsure: 2 },
    comments: [
      {
        id: 'c-1',
        authorName: 'Dev M.',
        text: 'Same here — I moved to another seat last week.',
        createdAt: 'Yesterday',
      },
      {
        id: 'c-2',
        authorName: 'Aisha B.',
        text: 'The technician came this morning, it looks fixed now.',
        createdAt: '5 hours ago',
      },
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
    author: { name: ANONYMOUS_AUTHOR_LABEL, isAnonymous: true },
    image: {
      src: '/demo/dark-corridor.svg',
      alt: 'Illustration of a dark stairwell with a flickering ceiling light',
    },
    createdAt: '4 days ago',
    history: [
      { status: 'submitted', date: '4 days ago', note: 'Reported by a student.' },
      { status: 'verified', date: '3 days ago', note: 'Confirmed by a moderator.' },
    ],
    reactions: { like: 9, dislike: 0, unsure: 3 },
    comments: [
      {
        id: 'c-3',
        authorName: 'Leo P.',
        text: 'It happens every night near the vending machine too.',
        createdAt: '3 days ago',
      },
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
    author: { name: 'Marcus T.', isAnonymous: false },
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
    reactions: { like: 24, dislike: 0, unsure: 1 },
    comments: [
      {
        id: 'c-4',
        authorName: 'Nora K.',
        text: 'Thanks, the floor is finally dry.',
        createdAt: '2 days ago',
      },
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
    author: { name: 'Chen W.', isAnonymous: false },
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
    reactions: { like: 31, dislike: 2, unsure: 5 },
    comments: [
      {
        id: 'c-5',
        authorName: 'Ivan D.',
        text: 'Still dropping during evening hours.',
        createdAt: '4 days ago',
      },
      {
        id: 'c-6',
        authorName: 'Mia F.',
        text: 'I reported this last month too.',
        createdAt: '5 days ago',
      },
      {
        id: 'c-7',
        authorName: 'Tomas R.',
        text: 'Library staff say a new router has been ordered.',
        createdAt: '6 days ago',
      },
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
    author: { name: ANONYMOUS_AUTHOR_LABEL, isAnonymous: true },
    videoLabel: 'Short clip of the blocked ramp',
    createdAt: '1 day ago',
    history: [
      { status: 'submitted', date: '1 day ago', note: 'Reported by a student.' },
      { status: 'under_review', date: '1 day ago', note: 'A moderator is checking the details.' },
    ],
    reactions: { like: 17, dislike: 0, unsure: 4 },
    comments: [
      {
        id: 'c-8',
        authorName: 'Sara L.',
        text: 'There is a service lift around the back, but it is much farther.',
        createdAt: '22 hours ago',
      },
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
    author: { name: 'Fatima R.', isAnonymous: false },
    createdAt: '3 weeks ago',
    history: [
      { status: 'submitted', date: '3 weeks ago', note: 'Reported by a student.' },
      {
        status: 'rejected',
        date: '3 weeks ago',
        note: 'Already fixed in scheduled maintenance the same day.',
      },
    ],
    reactions: { like: 3, dislike: 1, unsure: 6 },
    comments: [
      {
        id: 'c-9',
        authorName: 'Priya S.',
        text: 'Maintenance covered it the same afternoon.',
        createdAt: '3 weeks ago',
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
    author: { name: 'Jordan L.', isAnonymous: false },
    createdAt: '6 hours ago',
    history: [{ status: 'submitted', date: '6 hours ago', note: 'Reported by a student.' }],
    reactions: { like: 5, dislike: 0, unsure: 1 },
    comments: [],
    isDemo: true,
  },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
);
