# Roadmap

Milestones from first scaffold to a hosted 1.0. Each milestone ends with the
same gate: **tests green → lint clean → typecheck clean → production build →
docs updated → verified push**, then a stop for review.

## Milestone status

| #   | Milestone                            | Status  |
| --- | ------------------------------------ | ------- |
| M1  | Scaffold + Facebook-style demo feed  | ✅ done |
| M2  | API and database                     | ⬜ next |
| M3  | Authentication and roles             | ⬜      |
| M4  | Real reports with media              | ⬜      |
| M5  | Moderation workflow                  | ⬜      |
| M6  | AI: photo & video identification     | ⬜      |
| M7  | Media trust: provenance & AI-content | ⬜      |
| M8  | Server-side community features       | ⬜      |
| M9  | Search and discovery                 | ⬜      |
| M10 | Notifications                        | ⬜      |
| M11 | Performance, i18n, hardening         | ⬜      |
| M12 | Security review and audit            | ⬜      |
| M13 | Launch and operations (1.0)          | ⬜      |

---

## M1 — Scaffold + Facebook-style demo feed ✅

- Monorepo (client / server / shared), design system, theme toggle, toasts.
- **Facebook-style feed**: author header (or "Anonymous student"), centered
  single-column posts, media, and status history.
- **Reactions on every post** — Like / Dislike / Don't know, icon-only buttons
  with counts, single active reaction, tap-again-to-remove, `aria-pressed`.
- **Comment thread on every post** — demo comments plus a working composer.
- **Account-based posting** — composer shows who you are posting as, with an
  optional **Post anonymously** checkbox.
- Demo data is synthetic and labelled; tests (57), lint, typecheck, build, CI,
  README, contributing/security/code-of-conduct docs, licence.

**Done when:** the demo runs with zero keys, the full gate is green, and the
features above are visible in the browser.

## M2 — API and database

- Supabase project schema: `profiles`, `reports`, `report_updates`, `media`,
  `reactions`, `comments`, with row-level security.
- Express routes: create/list/detail reports, reactions, comments; uniform
  plain-language error shape; pagination.
- Supabase Storage buckets for photos/clips with MIME + size validation against
  `LIMITS`.
- Seed script for clearly-marked demo fixtures.

**Done when:** an API integration test can post, react, and comment against a
throwaway project; no secret exists outside `.env`.

## M3 — Authentication and roles

- Google OAuth flow, server-side session cookie, e-mail domain gate via
  `UNIVERSITY_EMAIL_DOMAIN`.
- Roles `visitor` / `user` / `admin`; UI reacts to the signed-in state.
- Sign-out, session expiry, and "you must sign in" recovery paths.

**Done when:** only university-domain accounts can post; RLS denies writes for
anonymous clients; auth tests cover accept/reject cases.

## M4 — Real reports with media

- The demo composer talks to the API: photo **and** short video clip upload
  (≤ 60 s, ≤ limits in `shared`), progress + failure recovery.
- Feed loads from the server with pagination/infinite scroll; demo mode remains
  available behind a flag.
- Per-report detail view with full history.

**Done when:** a report filed in the browser appears after a refresh, survives
logout, and shows correct media thumbnails.

## M5 — Moderation workflow

- Admin queue: verify, assign, resolve, reject — each transition writes a
  `report_updates` row shown under "View updates".
- Edit/retract/hide tools with audit trail; abuse reporting for comments.
- Recurrence groundwork: identical-location matching for status `reopened`.

**Done when:** a moderator can move a report through every status and the change
is visible to students immediately.

## M6 — AI: photo & video identification

- **Photo identification**: an open-weight vision-language model
  (`qwen/qwen2.5-vl-7b-instruct:free` on OpenRouter) suggests what the photo
  shows (broken chair, leaking tap, …) to pre-fill category and description.
- **Video identification**: short clips are reduced to a small set of sampled
  frames server-side, and the _frames_ — never the whole clip — go to the model;
  outputs from the frames are merged into one suggestion. See
  [`AI_LIMITATIONS.md`](AI_LIMITATIONS.md) for sampling rules and limits.
- **Similar-report detection**: local open-source embeddings rank possibly
  duplicate reports so repeats link to the original instead of fragmenting.
- Everything is optional: no key → no suggestion, zero functional loss; model
  licence verified before adoption (Apache-2.0 / MIT only).

**Done when:** adding a photo or clip can pre-fill a suggestion the author may
edit or ignore; no AI output is ever applied without user/moderator consent;
rate-limit and no-key fallbacks are tested.

## M7 — Media trust: provenance and AI-generated content

- **Provenance**: C2PA content credentials verified for uploaded photos/clips
  (via a Rust `c2pa` binding — licence currently `NOASSERTION`, must be
  confirmed before adoption).
- **AI-generated image detection**: evaluate an open detector (the earlier
  GenImage link is dead — re-locate and re-verify licence) and present results
  as a confidence hint for moderators, never as an automatic rejection.
- Tamper/exif checks and re-encoding to strip unsafe metadata.

**Done when:** moderators see provenance and AI-likelihood hints per medium;
licences for every new dependency are recorded in `AI_LIMITATIONS.md`.

## M8 — Server-side community features

- Persist reactions and comments (unique constraints make toggling safe);
  edit/delete own comments, moderation hide.
- Anonymous posting enforced server-side: author id stored, public projection
  limited to `ANONYMOUS_AUTHOR_LABEL`.
- Recurring-problem flag: a location reopened N times is labelled "Recurring"
  on the feed with a link to the earlier reports.

**Done when:** reactions/comments survive reload and are per-user correct;
anonymous authors never leak through any endpoint.

## M9 — Search and discovery

- Full-text search over title/description/location, category/status/severity
  filters, sort options; optional campus map view.
- "Reported here before" context on the composer.

**Done when:** search matches DB fixtures in integration tests and stays
keyboard- and screen-reader-friendly.

## M10 — Notifications

- In-app notification centre: status changes on reports you follow, replies to
  your comments.
- Optional e-mail digests (transactional provider, opt-in, no student addresses
  exposed anywhere).

**Done when:** following a report yields a notification on each status change;
opt-out works.

## M11 — Performance, i18n, hardening

- Route-level code splitting, image lazy-loading + thumbnails, bundle budget.
- i18n scaffolding for status/error strings (they already live in `shared`).
- Lighthouse/mobile passes from 320–1440 px, reduced-motion support.

**Done when:** budgets hold in CI and audits show no regressions.

## M12 — Security review and audit

- Dependency audit, secret scan, upload-abuse testing, RLS policy review,
  session hardening (httpOnly/SameSite), rate limiting on auth and AI routes.
- External `SECURITY.md` dry-run: reproduce, fix, advisory.

**Done when:** no high/critical findings remain; audit notes published.

## M13 — Launch and operations (1.0)

- Hosting (client static, server container), environment promotion, backups,
  uptime/error monitoring, runbook.
- Public 1.0 with stable API versioning and a semver policy.

**Done when:** a fresh contributor can deploy from the docs alone.

---

## Cross-cutting rules (every milestone)

1. Gate green: tests, lint, typecheck, build, prettier.
2. No secrets, no real student data — demo fixtures stay synthetic.
3. Accessibility and 320 px mobile layout checked for any UI change.
4. AI remains optional; every new model's licence is verified and recorded.
5. Verified push, then stop for review before the next milestone.
