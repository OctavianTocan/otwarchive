# ADR 0001 — Inertia SSR topology (unicorn vs Puma vs Node sidecar)

**Status:** Proposed
**Date:** 2026-07-05
**Context:** React migration (Inertia). Guest-facing pages (works/tags/browse) need server-rendered HTML for SEO + first paint; CSR ships an empty `#app`. This ADR decides how SSR runs.

## Problem

Inertia SSR requires a **JavaScript runtime** to render page components to HTML server-side. Two facts constrain us:

1. **The app runs on unicorn, not Puma** (`Gemfile` — unicorn `~> 5.5` is the deployed server; Puma is bundled only as a "planned migration"). Inertia-Rails' first-class SSR integration is a **Puma plugin** (`plugin :inertia_ssr`) — unavailable under unicorn.
2. **The web container has no Node** (Ruby-only image; the React client is host-built and served as a static bundle). So SSR is *always* a separate process, regardless of app server.

## Spike findings (verified 2026-07-05)

- **JS-side SSR works.** A self-contained Node SSR bundle (`app/frontend/ssr/ssr.tsx` → `@inertiajs/react/server` `createServer` + `ReactDOMServer.renderToString`) renders a real page: POSTing a `WorkShow` page object returns `{head, body}` with 6.8 KB of server-rendered HTML containing the actual content. No code changes to pages were needed.
- The SSR server binds `0.0.0.0:13714` (reachable in principle).
- **App-server ↔ SSR networking is the real cost.** From the Node-less web container, reaching a host-side SSR process is a deployment concern (the dev docker bridge had no routable gateway in this setup). In prod this means the SSR sidecar must be co-located / on an internal address the Rails workers can reach.

## Options

**A. Migrate unicorn → Puma + `plugin :inertia_ssr`.**
Inertia-Rails manages the Node SSR process as a Puma plugin (health checks, restarts). *Pro:* first-class, least glue. *Con:* forces a web-server migration (unicorn is deeply wired into Capistrano deploy/`rebalance_unicorns`); still needs Node available to the Puma host; couples SSR lifecycle to the app server.

**B. Standalone Node SSR sidecar (recommended).**
Run the built `ssr.mjs` as its own long-lived Node service (systemd unit or a sidecar container) on an internal address; set inertia-rails `config.ssr_enabled = true` + `config.ssr_url = "http://<sidecar>:13714"`. *Pro:* works with unicorn today; decouples SSR from the app server; scales independently; the container staying Node-less is fine. *Con:* one more service to run + monitor; a build step for the SSR bundle; the app workers must reach it (internal networking).

**C. No SSR (CSR only).** Rejected for guest pages — empty HTML to crawlers; unacceptable for a public archive.

## Decision

**Adopt Option B — a standalone Node SSR sidecar** — and enable SSR **only for guest-facing pages** (works index/show, tag/browse, collections/series); authed pages (dashboard, editor) can stay CSR (no SEO need). Revisit Option A only if/when the planned Puma migration lands, at which point the sidecar can fold into the Puma plugin with no page-code changes.

## Consequences

- New ops surface: a Node process running `spike/ssr/ssr.mjs` (rebuilt alongside the client bundle), health-checked, on the internal network; `ssr_url` configured per environment.
- Build pipeline emits two bundles: the client (`public/vite-inertia/`) and the SSR (`ssr.mjs`).
- Per-page opt-in for SSR keeps the Node process load bounded to public content.
- Reversible: `config.ssr_enabled = false` falls back to CSR instantly.

## Verification artifacts

- `app/frontend/ssr/ssr.tsx`, `app/frontend/vite.ssr.config.ts` (SSR entry + build).
- `spike/ssr/run.sh` (build + run the SSR server), and the POST-render proof above.
