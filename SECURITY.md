# Security Policy

## Supported versions

The project is pre-1.0; security fixes land on `main`. Deployments should track
`main` and re-deploy when a fix is published.

| Version | Supported             |
| ------- | --------------------- |
| `main`  | ✅ active development |
| older   | ❌                    |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Instead, use GitHub's private reporting channel:

1. Open the repository → **Security** tab → **Report a vulnerability**
   (GitHub Security Advisories).
2. Describe the issue: what it is, how to reproduce, what an attacker could do.
3. If you have a fix or a patch, mention it — welcome but not required.

You can also contact the maintainer privately via GitHub (`cmidul`) if the
advisory form is unavailable.

We aim to acknowledge reports within **7 days** and to publish a fix or a
public disclosure timeline within **30 days**, depending on severity and
complexity.

## What matters to this project

- **Authentication & authorisation** — Google OAuth e-mail domain checks,
  role checks (`visitor` / `user` / `admin`), and Supabase row-level security.
- **Privacy** — anonymous posts must never leak the author's identity to other
  students; uploaded photos/clips must not expose private user data.
- **Injection & upload safety** — SQL injection, XSS, unsafe file uploads
  (photo/video validation), path traversal in storage keys.
- **Secrets** — no keys, tokens, `.env` files, or real student data may ever be
  committed. If you find one in history, report it so we can rotate and purge.

## Scope notes

- The demo's synthetic data is fake by design; problems that only exist in
  demo fixtures are still worth a report if they hint at a real vulnerability.
- Third-party services (Supabase, Google, OpenRouter) have their own channels;
  reports about how _we_ integrate them belong here.
