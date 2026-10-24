# Contributing to Campus Issue Memory

Thanks for helping — this project exists so students can hold campuses accountable, and every contribution counts.

## Ground rules

1. **One milestone / one concern per pull request.** Small, reviewable PRs merge fast.
2. **Never commit secrets.** No `.env`, API keys, real student data, or real campus complaints. Demo data must stay synthetic and labelled.
3. **Plain language in the UI.** No jargon reaches end users; status and error wording lives in `shared/` so client and server agree.
4. **Accessibility is not optional.** Keyboard support, labels, focus management, and contrast come with any UI change.
5. **AI stays optional.** Nothing may require an AI service to work; graceful fallback is part of the contract (see `docs/AI_LIMITATIONS.md`).

## Development setup

```bash
git clone https://github.com/cmidul/campus-issue-memory.git
cd campus-issue-memory
npm install
npm run dev
```

Before opening a PR, run the full gate — CI runs the same steps:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx prettier --check .
```

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(report): add anonymous posting option
fix(dialog): return focus to the trigger button
docs(roadmap): record video identification in M6/M7
test(reactions): cover switching from like to dislike
```

## Pull request process

1. Branch from `main`: `git checkout -b feat/short-description`
2. Make the change, add or update tests, keep the docs in sync.
3. Run the gate above; all green before requesting review.
4. Describe _what_ changed and _why_; link the issue if there is one.
5. Squash-merge is at the maintainer's discretion.

## Reporting bugs

Open an issue with:

- What you did, what you expected, what happened
- Steps to reproduce, browser + OS
- Screenshots for UI problems
- Whether it happens in demo mode (no `.env`)

## Security issues

Do **not** open a public issue. Follow [SECURITY.md](SECURITY.md).

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
