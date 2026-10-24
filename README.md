# Campus Issue Memory

An open-source platform for reporting problems on campus — broken chairs, dark stairwells, leaking taps — and tracking whether they actually get fixed, and whether they come back.

Students post a report with a photo or a short clip, moderators verify it, and everyone can follow the updates. Facebook-style reactions (Like / Dislike / Don't know) and a comment thread sit on every post, and you can post from your university account **or anonymously**.

**Demo mode works with zero configuration** — no database, no OAuth, no AI keys. Synthetic sample data is clearly labelled as such.

## Why

Campus maintenance reports usually vanish into an inbox. Students never learn what happened, and recurring problems look like new complaints every semester. This project keeps the memory: every report, update, reaction, and comment in one public place.

## Features

- **Short report flow** — photo _or_ short video clip (MP4/WebM, up to 60 s), description, location, done in under a minute.
- **Facebook-style feed** — author header (or "Anonymous student"), Like / Dislike / Don't-know reactions with counts, and a comment thread on every post.
- **Account-based posting** — post from your university account or tick _Post anonymously_; moderators still know who filed it.
- **Plain-language statuses** — Submitted → Under review → Verified → In progress → Resolved (with Reopened/Rejected), explained on the page itself.
- **Light & dark theme** — one toggle, persisted, respects the OS preference on first visit.
- **Accessible & mobile-first** — keyboard navigation, focus traps in dialogs, live regions for toasts, safe-area padding, works from 320 px up.
- **AI-assisted (optional)** — a description suggestion from an open-weight vision-language model after you add a photo or clip. Never required; the form works fully without it.
- **AI image & video identification (planned)** — provenance and AI-generated-media checks; short clips are analysed by sampling frames, never by uploading the whole file (see [`docs/AI_LIMITATIONS.md`](docs/AI_LIMITATIONS.md)).

## Stack

| Layer    | Tech                                                            |
| -------- | --------------------------------------------------------------- |
| client   | React 19, Vite, TypeScript, Tailwind CSS v4                     |
| server   | Node.js, Express 5, TypeScript                                  |
| shared   | Domain vocabulary (statuses, categories, limits) shared by both |
| database | Supabase (PostgreSQL + Storage), row-level security             |
| auth     | Google OAuth, server-side university e-mail domain check        |
| AI       | Qwen2.5-VL (free tier) + local open-source embeddings           |
| tests    | Vitest, Testing Library, axe-core                               |

## Getting started

```bash
git clone https://github.com/cmidul/campus-issue-memory.git
cd campus-issue-memory
npm install
npm run dev
```

- Client: http://localhost:5173 (or the next free port)
- API: http://localhost:4000/api/health

No `.env` needed for the demo. When you're ready for real sign-in and storage, copy `.env.example` to `.env` and fill in what you need — each key is optional and documented there.

## Scripts

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Client + server in watch mode             |
| `npm run build`     | Production build (client + server bundle) |
| `npm test`          | All workspace tests                       |
| `npm run lint`      | ESLint across workspaces                  |
| `npm run typecheck` | TypeScript, no emit                       |
| `npm run format`    | Prettier write                            |

## Project layout

```
client/   React app (Vite, Tailwind)
server/   Express API
shared/   Types & constants used by both
docs/     Architecture, roadmap, AI limitations
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the pieces fit together
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — milestones, including video identification
- [`docs/AI_LIMITATIONS.md`](docs/AI_LIMITATIONS.md) — what the AI can and cannot do, verified model licences
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to open a pull request
- [`SECURITY.md`](SECURITY.md) — how to report a vulnerability

## Licence

[MIT](LICENSE)
