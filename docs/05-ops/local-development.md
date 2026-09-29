# Local Development

This repository uses `npm` as its current package manager because it tracks `package-lock.json`.

## Setup

```bash
npm install
npx playwright install
```

## App Runtime

Start the Next.js development server:

```bash
npm run dev
```

By default Next.js uses port `3000`. For the workstation runtime convention used by QA, run:

```bash
PORT=3100 npm run dev
```

For a production-style local server:

```bash
npm run build
npm start -- -p 3100
```

## Supabase Local

Start and inspect the local Supabase stack:

```bash
npx supabase start
npx supabase status
```

Stop it when finished:

```bash
npx supabase stop
```

## QA Commands

Core validation:

```bash
npm run typecheck
npm test
npm run build
```

Local UI QA against a running app:

```bash
QA_BASE_URL=http://localhost:3100 node scripts/qa-run-local-ui.js
```

OAuth navigation audit against a running app:

```bash
QA_BASE_URL=http://localhost:3100 node scripts/qa-oauth-local-audit.js
```

Summarize network artifacts:

```bash
node scripts/qa-network-artifacts-summary.js
```

Do not commit local `.env*` files, generated QA evidence, logs, or Supabase branch metadata.
