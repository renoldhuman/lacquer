This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local Development (with Supabase)

This app uses:
- **Supabase Auth** (email/password) via `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Prisma** to connect to Postgres via `DATABASE_URL`

### Run everything locally (recommended)

1) Install the Supabase CLI (one-time)

- **macOS (Homebrew)**:
  - `brew install supabase/tap/supabase`
- **No install (npx, any OS)**:
  - `npx supabase@latest --version`
  - `npx supabase@latest start`
  - `npx supabase@latest status`

2) Start local Supabase (runs Postgres + Auth + API locally)

- From the repo root, run:
  - `supabase start`
- Supabase will print values like:
  - API URL: `http://localhost:54321`
  - DB URL: `postgresql://postgres:postgres@localhost:54322/postgres`
  - Anon key: (a long JWT-like string)
- You can re-print them later with:
  - `supabase status`

3) Create your local env file

- Copy the committed example file:
  - Copy `env.local.supabase.example` → `env.local.supabase`
- Fill in:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from `supabase start/status`)
  - (Optional) `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

4) Start the Next.js dev server (local Supabase)

- `npm run dev:local`

Notes:
- `npm run dev:local` automatically runs `prisma db push` to create/update the local schema.
- If you want seed data, run `npm run db:seed` separately.

### Troubleshooting (local Supabase)

- If you see: `The table public.users does not exist in the current database`
  - Your local Postgres is running, but the app schema hasn’t been created yet.
  - Fix:
    - Ensure local Supabase is running: `supabase start`
    - Create tables: `npm run db:push`
    - Then re-run: `npm run dev:local`

### Point local Next.js at remote Supabase (optional)

If you want to run the UI locally but use the **remote** Supabase project:

1) Copy `env.remote.supabase.example` → `env.remote.supabase`
2) Fill in your remote:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3) Run:
   - `npm run dev:remote`

### How switching works

- `npm run dev:local` copies `env.local.supabase` → `.env.local` (Next.js) **and** `.env` (Prisma), then starts `next dev`
- `npm run dev:remote` copies `env.remote.supabase` → `.env.local` (Next.js) **and** `.env` (Prisma), then starts `next dev`

Your actual secrets live in `.env.*` files, which are ignored by git (`.gitignore` has `.env*`).

### Note on RLS (Row-Level Security)

Supabase RLS is enforced per **authenticated JWT** on Supabase APIs.
Prisma connects via a normal Postgres connection string; RLS enforcement depends on how that DB role/session is configured.
In this codebase we also enforce user separation at the application layer (server actions filter by the current authenticated user id).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
