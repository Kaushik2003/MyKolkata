# MyKolkata

The production Next.js app lives in **[`frontend/`](frontend/)**.

## Quick start

```bash
cd frontend
cp .env.example .env.local   # fill in Clerk, DB, Ola keys
npm install
npm run dev
```

From the repo root you can also run:

```bash
npm run dev      # → frontend
npm run build
npm test
```

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + brand tokens (`frontend/styles/brand-tokens.css`)
- Clerk auth (`frontend/proxy.ts`)
- Prisma / Postgres (`frontend/prisma`)
- Ola Maps for Near You

## Layout

```text
frontend/
  app/           # App Router routes + API Route Handlers
  components/    # layout, explore, providers
  lib/           # db, catalogue, places domain
  prisma/
  scripts/
  public/
  tests/
design/          # brand / design references (not part of the build)
```
