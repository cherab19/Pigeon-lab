# Pigeonlab migration notes

The legacy Vite application is retained outside `elab/` only as the migration reference. This folder replaces its browser build with Next.js App Router, Supabase auth with Auth.js, database tables/RLS with PostgreSQL and Prisma plus server authorization, edge functions with route handlers, and storage with `lib/storage.ts`.

The original 15 SQL migrations are the source for the Prisma schema; the initial Prisma migration is generated from it. Chapa, invitations, AI and route-handler work remains to be migrated before this application can be considered feature-complete.
