# Architecture

How Campus Issue Memory fits together, and where each piece is heading.

## Big picture

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│ client       │     │ server        │     │ Supabase         │
│ React+Vite   │────▶│ Express 5     │────▶│ PostgreSQL       │
│ Tailwind v4  │     │ TS, zod-ready │     │ Storage + RLS    │
└──────────────┘     └───────────────┘     └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ OpenRouter (opt.)│  open-weight vision model
                     │ local embeddings │  duplicate detection
                     └──────────────────┘
```

Today the demo runs entirely in the client: synthetic posts, local reaction and
comment state, no network calls beyond the Vite dev server. Everything below the
"demo mode" line exists as code or planned schema, and each integration is
optional — the app must stay usable with zero keys.

## Monorepo layout

| Path      | Package       | Role                                                     |
| --------- | ------------- | -------------------------------------------------------- |
| `client/` | `client`      | React app: pages, components, design system, demo data   |
| `server/` | `server`      | Express API: health check now; reports, auth, AI proxies |
| `shared/` | `@cim/shared` | Domain vocabulary both sides must agree on               |
| `docs/`   | —             | Architecture, roadmap, AI limitations                    |

npm workspaces keep one lockfile, one install, and one version of shared types.
`npm run dev` runs client and server together in watch mode.

## Shared vocabulary (`shared/src/index.ts`)

Single source of truth for anything a user reads or the database stores:

- **Statuses** (`ReportStatus`) and their plain-language labels/descriptions —
  `Submitted → Under review → Verified → In progress → Resolved`, plus
  `Reopened` and `Rejected`. The UI never invents status wording.
- **Categories** (`CATEGORIES`), **severities** (`SEVERITIES`).
- **Reactions** (`ReactionType = 'like' | 'dislike' | 'unsure'`) with labels and
  short descriptions.
- **`Comment`** — id, author, text, plain-language timestamp for the demo.
- **`ANONYMOUS_AUTHOR_LABEL`** — the only public name anonymous posts ever get.
- **`LIMITS`** — description length, photo/video types and byte limits. The
  client validates with the same numbers the server will enforce.

## Client architecture

```
client/src/
├── App.tsx              feed page: composer prompt, filters, sections
├── components/
│   ├── ui/              design system: Button, Dialog, FormField, Toast,
│   │                    Avatar, StatusBadge, …  (each with its own tests)
│   ├── report/          ReportCard (post), ReactionBar, CommentSection,
│   │                    ReportDialog (composer)
│   └── layout/          Header (theme + nav), Footer
├── data/demoReports.ts  synthetic posts, comments, reactions, demo viewer
└── test/a11y.test.tsx   axe checks for the page and the open dialog
```

- **State**: plain React state. Reaction counts, comments, filters, and theme
  are all local; nothing is persisted (demo mode). This keeps the demo honest —
  there is no server pretending to save things.
- **Theming**: CSS variables in `index.css` (`--color-accent-*`, `--color-line`,
  …) mapped into Tailwind v4 via `@theme`. Light/dark is a `dark` class on
  `<html>` with a `localStorage` mirror and a system-preference first visit.
- **Accessibility patterns**: skip link, one `sr-only` `h1`, labelled controls,
  `aria-pressed` on reaction toggles, focus trap + focus restore in `Dialog`,
  `role="status"` toast live region, 44 px minimum touch targets.
- **Demo safety**: every post carries `isDemo: true`, the feed is labelled
  "posts shown (demo data)", and all people/places are invented.

## Server architecture

```
server/src/
├── index.ts     Express bootstrap, JSON body limit, CORS for the client origin
└── routes/      health now; reports / auth / ai milestones M2–M6
```

- Plain-language errors: every error body is `{ error: { code, message } }`
  with text a student can read — no stack traces or SQL in responses.
- The API is read-only in Milestone 1 (`GET /api/health`). Growth path:
  `GET/POST /api/reports`, `GET /api/reports/:id`, `POST /api/reports/:id/comments`,
  `POST /api/reports/:id/reactions`, moderation endpoints behind role checks.
- Secrets are read from environment variables only (`.env.example` documents
  each one); nothing sensitive is ever shipped to the browser bundle.

## Data model (planned, Milestone 2+)

| Table            | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `profiles`       | one row per signed-in student (role: `visitor`/`user`/`admin`)       |
| `reports`        | report rows incl. `is_anonymous`, status, location, category         |
| `report_updates` | the status history shown under "View updates"                        |
| `media`          | photo/clip objects in Supabase Storage, content-type + size checked  |
| `reactions`      | one row per (report, profile) — the unique index makes toggling safe |
| `comments`       | thread rows, soft-deletable by moderation                            |

Row-level security enforces the same rules at the database layer: students read
published reports, write only their own reactions/comments, and anonymous posts
store the author id server-side while exposing only
`ANONYMOUS_AUTHOR_LABEL` to other students.

## Authentication (planned, Milestone 3)

Google OAuth → callback verifies the e-mail ends with
`UNIVERSITY_EMAIL_DOMAIN` → server sets an httpOnly session cookie → role comes
from `profiles`. No student e-mail address is ever shown in the UI or sent to
the AI provider.

## AI pipeline (planned, Milestone 6–7)

```
photo ─────────────────────────────────┐
clip ─▶ frame sampling (N key frames) ─┴─▶ resize ─▶ open-weight VL model
                                                   ─▶ suggested description
                                                   ─▶ shown to the author,
                                                      who can edit or ignore
```

- **Optional by construction**: no key → the step is skipped silently; the
  form works exactly the same.
- **Video is sampled, never sent whole** to the model — see
  [`AI_LIMITATIONS.md`](AI_LIMITATIONS.md) for the sampling rules and why.
- Duplicate/similar-report detection runs on **local** open-source embeddings,
  not a hosted service.
- AI output is a _suggestion_. A moderator confirms every report; AI never
  rejects, hides, or deprioritises anything on its own.

## Demo mode vs. connected mode

| Concern     | Demo (today)                       | Connected (M2+)                      |
| ----------- | ---------------------------------- | ------------------------------------ |
| Data        | `demoReports.ts`, clearly labelled | Supabase, real accounts              |
| Reactions   | local state per post               | unique row per (report, profile)     |
| Comments    | local state per post               | table rows, moderation + soft delete |
| Auth        | fixed demo viewer "Alex Kim"       | Google OAuth + domain gate           |
| AI          | not called                         | OpenRouter free tier, frames only    |
| Keys needed | none                               | per-feature, all documented          |

## Testing strategy

- **Unit/component**: Vitest + Testing Library; each `ui/` component and each
  `report/` component has its own test file.
- **Accessibility**: axe-core over the page and the open dialog. `color-contrast`
  is disabled under jsdom (no real rendering) — contrast is checked manually in
  a real browser instead.
- **Integration**: `server` tests cover the health route and error shape;
  `shared` tests lock the vocabulary invariants (status ordering, limits).
- **CI**: `.github/workflows/ci.yml` runs lint → typecheck → test → build on
  every push and pull request.

## Security notes

- `.env` is git-ignored; `.env.example` lists placeholders only.
- Uploads are validated by MIME type, extension, and byte size against
  `LIMITS` before touching storage.
- Anonymous posting hides identity from _other students_, never from the
  server — moderators must be able to act on abuse.
- Error responses stay plain-language and leak no internals.
