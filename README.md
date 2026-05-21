<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# PREDICTPLAY AI

An AI-first sports companion that "watches the match with you." Gemini (server-side) is the core product: storytelling, momentum detection, proactive conversations, prediction challenges, coaching, and what-if simulations. The app always works in Demo Mode without live sports APIs so it can be judged or demoed offline.

View the running dev server at http://localhost:3000 when the app is started.

**This repository contains:** a Vite React frontend, an Express + Socket.IO bridge server, a small Gemini wrapper (`server_ai.ts`), and a demo-mode scripted match simulator.

**Quick Links**

- Server: [server.ts](server.ts)
- Server AI helper: [server_ai.ts](server_ai.ts)
- Live page: [src/pages/LiveMatchPage.tsx](src/pages/LiveMatchPage.tsx)
- Client live hook: [src/hooks/useLive.ts](src/hooks/useLive.ts)
- Auth store: [src/store/useAuthStore.ts](src/store/useAuthStore.ts)
- Example env: [.env.example](.env.example)

**Status (verification performed locally)**

- Dev server starts and serves the app on http://localhost:3000 (checked).
- TypeScript type-check passes (`npm run lint`).
- Demo Mode simulator emits scripted events and emits AI messages (fallback) without a Gemini key.
- Socket.IO bridge is active and clients can `join` a match room to receive events.

If you see errors referencing `GEMINI_API_KEY is missing`, the app is still fully functional in demo/fallback mode — set your Gemini API key to enable real AI responses.

## Features

- Gemini-powered: storytelling, prediction question generation, coaching responses, debate mode, what-if simulation (server-side via `@google/genai`).
- Demo Mode: scripted IPL-style events with proactive AI messages so the UI always looks live even offline.
- Real-time delivery: Socket.IO (server -> clients) for low-latency updates; optional Firestore listeners are still supported for auth/profile storage.
- Clean auth handling: `useAuthStore` now returns cleanup for listeners to avoid leaks.

## Getting started (local development)

Prerequisites

- Node.js (tested on Node 20+ / 24+), npm

Steps

1. Install dependencies

```bash
npm install
```

2. Configure environment

- Copy `.env.example` to `.env` or `.env.local` and set values. At minimum, for demo mode you do not need a Gemini key. To enable real Gemini-powered responses set `GEMINI_API_KEY`.

Example `.env` (project root)

```
GEMINI_API_KEY=your_real_gemini_key_here
CRIC_API_KEY=optional_cricapi_key_for_live_scores
APP_URL=http://localhost:3000
```

3. Run in development

```bash
npm run dev
```

This runs `tsx server.ts` which starts the Express server, attaches Vite middleware in dev, and also starts a Socket.IO server for real-time events.

4. Verify TypeScript types

```bash
npm run lint
```

## Demo Mode (always works)

The app ships with a built-in scripted simulator that emits events and AI messages (fallback) so the experience is always demo-ready.

Start the demo simulator (example using PowerShell):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/demo/start -Method POST -Body '{"matchId":"mock_ipl_match"}' -ContentType 'application/json' -UseBasicParsing
```

Stop the demo simulator:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/demo/stop -Method POST -Body '{"matchId":"mock_ipl_match"}' -ContentType 'application/json' -UseBasicParsing
```

You can also trigger a one-off AI conversation and broadcast it to a match room via:

```bash
curl -X POST http://localhost:3000/api/converse -H 'Content-Type: application/json' -d '{"prompt":"Give me a short match insight about CSK vs GT", "matchId":"mock_ipl_match"}'
```

## Key server endpoints

- `POST /api/demo/start` — start a scripted demo simulator for a match room (emits `match:event` and `aiMessage`).
- `POST /api/demo/stop` — stop the simulator.
- `POST /api/webhook` — receive provider webhooks and forward normalized events to match rooms.
- `POST /api/converse` — single-shot Gemini prompt; optionally broadcast result to a room.
- `POST /api/generate_prediction` — existing endpoint that generates a prediction question (uses Gemini if configured).
- `POST /api/generate_arcade` — generates arcade quiz scenarios via Gemini (has fallback pool).
- `POST /api/coach` — coach persona responses via Gemini.
- `POST /api/narrative` — short storyline generation via Gemini.

Files of interest

- [server.ts](server.ts) — main Express + Vite server, Socket.IO bridge, demo simulator and endpoints.
- [server_ai.ts](server_ai.ts) — centralized Gemini helper (includes safe fallback when key is missing).
- [src/hooks/useLive.ts](src/hooks/useLive.ts) — client hook that subscribes to realtime events and AI messages.
- [src/pages/LiveMatchPage.tsx](src/pages/LiveMatchPage.tsx) — Match Companion UI (example integration).
- [src/store/useAuthStore.ts](src/store/useAuthStore.ts) — auth store with proper unsubscribes.

## Gemini integration notes

- Gemini is only called from the server (never from the browser). This keeps keys secure and lets the server apply prompt templating, rate-limits, caching, and fallbacks.
- The server reads `GEMINI_API_KEY` from environment variables. If it is absent the system uses a deterministic demo fallback so the UI still receives sensible content.
- To enable real Gemini responses, set `GEMINI_API_KEY` in `.env` and restart the dev server.

## Production build

```bash
npm run build
npm run start
```

The `build` script runs Vite production build and bundles a server output (esbuild). `start` runs the built server (`node dist/server.cjs`).

## Verified checks performed by me locally

- `npm install` — completed successfully and installed Socket.IO packages.
- `npm run lint` — TypeScript check passed.
- Dev server startup — server runs at http://localhost:3000 and Vite HMR is active.
- Demo simulator — start/stop endpoints emit events and AI fallback messages to match rooms (verified via server logs and webhook responses).

## Next recommended improvements (prioritized)

1. Add an expressive `Match Companion` chat UI (center panel) with streaming AI messages and proactive controls.
2. Harden AI endpoints: server-side rate-limiting, request logging, signature validation for webhooks, and small in-memory dedupe cache for events.
3. Expand the `Match Simulator` to support historical match playback from JSON files and scenario branching.
4. Add ESLint, Prettier, `husky` + `lint-staged`, and a GitHub Actions workflow for CI (build + lint).
5. Add analytics and monitoring (Sentry) and usage dashboards for AI calls to monitor costs.

## Troubleshooting

- If the dev server fails to start with `EADDRINUSE: address already in use 0.0.0.0:3000`, find and stop the process holding port 3000, or change the `PORT` in `server.ts`.
- If you see `GEMINI_API_KEY is missing`, either set `GEMINI_API_KEY` in your `.env` file or rely on demo-mode fallbacks (app still works).

## Contribution & License

Contributions welcome. Open issues or PRs for features or bug fixes.

---

Built with ❤️ — PredictPlay AI

