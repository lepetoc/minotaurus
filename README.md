# Minotaurus

Minotaurus is a real-time chat application built with Next.js, PostgreSQL, NextAuth, and a separate WebSocket server.

The app supports:
- authentication
- real-time messages
- online users list
- persisted message history
- GIF search via Tenor
- dashboard pages for cached server-rendered data

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- PostgreSQL
- NextAuth
- WebSocket (`ws`)
- Tailwind CSS 4
- Radix UI / shadcn-style components

## Project Structure

```text
src/
  app/          Next.js routes and UI
  components/   shared UI components
  hooks/        client hooks
  lib/          shared utilities
server/
  src/          standalone WebSocket server
db/
  migrations/   SQL migrations
  schema.sql    current schema snapshot
docs/
  websocket.md  WS flow notes
  LightHouse_before.webp
  LightHouve_after.webp
```

## Main Features

- Home page chat UI backed by WebSocket updates
- Login and register flow with NextAuth session handling
- `/api/history` for persisted message history
- `/api/gifs` for Tenor search/featured results
- `/dashboard` for cached GIF search results
- `/dashboard/users` and `/dashboard/settings` for user data flows

## Environment Variables

Copy `.env.example` to `.env` and fill the values:

```env
DATABASE_URL=postgresql://minotaurus:minotaurus@localhost:5432/minotaurus
NEXTAUTH_SECRET=
NEXTAUTH_URL=
TENOR_API_KEY=
```

You also need the WebSocket server env values used by `server/`:

```env
WS_SECRET=
PORT=8080
DATABASE_URL=postgresql://minotaurus:minotaurus@localhost:5432/minotaurus
```

`WS_SECRET` must match between the Next.js app and the WebSocket server.

## Local Run

Install dependencies:

```bash
npm install
```

Run the Next.js app:

```bash
npm run dev
```

Run the WebSocket server in a separate terminal from `server/` or with your existing workflow.

The app expects:
- Next.js on `http://localhost:3000`
- WebSocket server on `ws://localhost:8080`
- PostgreSQL running locally

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Bundle analyzer:

- Bash:

```bash
ANALYZE=true npm run build
```

- PowerShell:

```powershell
$env:ANALYZE='true'; npm run build
```

The analyzer is configured in [next.config.ts](/abs/path/C:/Users/Alex/Documents/code/minotaurus/next.config.ts).

## Caching and Performance Notes

### Server-side caching

- Tenor search results on `/dashboard` use `fetch(..., { next: { revalidate, tags } })`
- featured GIF results use a longer cache window than search results
- user-related dashboard data uses revalidation tags

### Media delivery improvements

The main Lighthouse improvements came from media delivery changes:

- Tenor GIF previews now prefer `tinywebm` / `tinymp4`
- legacy Tenor `.gif` URLs are upgraded to video candidates at render time
- Tenor media is proxied through `/api/tenor-media`
- proxied media uses long-lived cache headers on the app domain
- the dashboard GIF section streams behind `Suspense`
- Geist fonts are loaded with `next/font`

Important:
- `next/image` is not currently used for animated GIF rendering in `src/`
- that is intentional for animated media, because animated GIFs do not benefit much from Next image optimization
- the current optimization strategy is video-first delivery plus caching

## Lighthouse Evolution

The project now includes screenshots of the Lighthouse evolution in `docs/`.

### Before optimization

![Lighthouse before optimization](docs/LightHouse_before.webp)

Observed metrics from the screenshot:

- Performance: `86`
- First Contentful Paint: `0.5 s`
- Largest Contentful Paint: `1.4 s`
- Total Blocking Time: `40 ms`
- Speed Index: `15.6 s`
- Cumulative Layout Shift: `0`

### After optimization

![Lighthouse after optimization](docs/LightHouve_after.webp)

Observed metrics from the screenshot:

- Performance: `96`
- First Contentful Paint: `0.3 s`
- Largest Contentful Paint: `1.0 s`
- Total Blocking Time: `130 ms`
- Speed Index: `0.6 s`
- Cumulative Layout Shift: `0`

### What changed

The score improvement is mainly explained by:

- lighter animated media delivery
- better repeat-visit caching for Tenor assets
- streaming the GIF results area with `Suspense`
- optimized font loading with `next/font`

## WebSocket Notes

The WebSocket protocol and auth flow are documented in [docs/websocket.md](/abs/path/C:/Users/Alex/Documents/code/minotaurus/docs/websocket.md).

High-level flow:

1. the client requests a short-lived WS token from `/api/ws-token`
2. the client opens the WebSocket connection
3. the client sends `{ "type": "auth", "token": "..." }`
4. the WS server validates the token and starts broadcasting updates

## Current Status

Current repo checks:

- `npm run lint` passes
- `npx tsc --noEmit` passes

If `next build` fails in a restricted environment, the remaining issue is likely external Google Fonts fetching from `next/font/google`, not TypeScript or ESLint.
