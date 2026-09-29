# Workstation Onboarding

This note records the expected local workstation shape for GanaConMerito development.

## Environment

- Primary workstation: Windows 11 with WSL2 Ubuntu.
- Repository path: `/home/mdav/dev/repos/GanaConMerito`.
- Runtime convention for local QA: `http://localhost:3100`.
- Package manager in this repository: `npm`.
- Backend dependency: Supabase CLI with Docker Desktop available from WSL2.

## Detected Stack

- Next.js and React.
- TypeScript.
- Supabase migrations and local CLI.
- Playwright for browser-driven QA.
- Node test runner via `tsx --test`.

## Operating Rules

- Keep secrets in local environment files or a secrets manager, never in Git.
- Keep generated QA evidence under ignored artifact/log paths.
- Prefer `npm` commands until an explicit package-manager migration is planned.
- Validate changes with `npm run typecheck`, `npm test`, and `npm run build` before publication.

## Useful References

- `docs/05-ops/gcm-local-runtime.md`
- `docs/05-ops/runtime-and-release.md`
- `docs/05-ops/DISASTER-RECOVERY-RESTORE-GUIDE-20260910.md`
- `docs/05-ops/local-development.md`
