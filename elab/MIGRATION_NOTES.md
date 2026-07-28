# Pigeonlab migration notes

`elab/` is the Docker-first Next.js 14 replacement for the legacy Vite application.

| Legacy artifact | Replacement |
| --- | --- |
| Vite routes and React Router | App Router pages under `app/` (including the catch-all not-found route) |
| Browser authentication and database client | Auth.js credentials/Google providers in `lib/auth.ts`, Prisma in `lib/prisma.ts`, and server-side authorization helpers |
| Database migrations, policies, RPCs, and triggers | `prisma/schema.prisma`, versioned Prisma SQL migrations, `lib/db/rpc/`, and authenticated route handlers |
| Edge functions | `app/api/**/route.ts`: Chapa, member/classroom administration, invitations, AI, textbook, progress, and gamification handlers |
| Object storage | `lib/storage.ts`, with local Docker-volume storage and an S3 driver seam |
| PWA integration | `next-pwa`, `public/manifest.json`, and the generated offline worker |
| Password and invitation links | one-time database/JWT token routes under `app/api/password-reset` and `app/api/invites/accept` |
| UI, translations, lab simulations, and design tokens | migrated `components/`, `contexts/`, `hooks/`, `i18n/`, Tailwind configuration, and `app/globals.css` |

The old platform-specific client and build integration are intentionally absent from this target. The legacy project outside `elab/` remains only as the historical migration reference.
