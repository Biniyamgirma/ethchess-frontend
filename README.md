# EthChess Admin

An internal admin dashboard for the EthChess youth chess club. Built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query/Table, React Hook Form, and Zod.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to the backend origin (defaults to `http://localhost:4000`).
3. Start the backend, then run `npm run dev`.
4. Open `http://localhost:3000`. Sign in with the admin first name and password configured in the backend.

Useful checks: `npm run lint`, `npm run format:check`, and `npm run build`.

## Backend integration

Requests use the backend's cookie-based admin session (`withCredentials: true`); the JWT remains in the backend's HttpOnly cookie.

Connected routes include admin login and role management, member list/update/removal, venue list/create/update, and venue-owner create/update. Events, bookings, the venue-owner directory, and the dashboard summary currently have no matching backend list endpoints. These screens call typed mock functions in `src/lib/api/` with `TODO: confirm endpoint` markers; sample content is labeled in the UI and is not persisted.

Admin permissions remain enforced by the backend. For example, owner and venue creation and admin role mutations may require elevated admin levels.

## Brand assets and fonts

The logo SVGs under `public/brand/` are clearly marked placeholders and should be replaced with the official EthChess lockups. Satoshi font weights are locally hosted under `public/fonts/satoshi/`; Space Grotesk is loaded with `next/font/google`.

The hidden `/design-check` route is available during development to review the themed UI kit and returns not found in production.
