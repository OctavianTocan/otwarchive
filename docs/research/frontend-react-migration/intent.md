# Frontend → React Migration — Intent Model

**Date:** 2026-07-05
**Status:** provisional (seeds flow/plan; does not replace its approval gate)

## What the user asked

"Look into this project and figure out how we could convert the **entire** frontend to React, using the **ai-app-template**, **without having to redo anything on the backend side.**"

## What they most likely mean

- Adopt the same React design system already proven in the AO3 sidebar island (the `cogram-ai-app-template` / `cogram-agentic-inbox` shadcn/Base-UI + Tailwind-v4 kit) as AO3's frontend vocabulary.
- Replace the aging ERB + jQuery presentation layer with React components, page by page ideally.
- Treat Rails (routes, controllers, models, Devise auth, business logic) as fixed — no new API tier, no rewrite of controllers if avoidable.

## Load-bearing premises (to challenge, not assume)

1. **"Without redoing anything backend" is achievable for a *full* frontend conversion.** — Contested. Islands need zero backend change; Inertia rewrites every migrated controller action's response (a view-layer/backend change); a JSON-API SPA needs a whole new serialization + API-auth tier. AO3 currently has **no JSON representation layer** (0 JSON views) — so any "React consumes data" path implies backend work.
2. **A full React SPA is compatible with AO3's product commitments.** — Contested/false for guest pages. AO3 publicly commits that *essential* features (filtering, searching, downloading) work **without JavaScript**. Inertia/SPA navigation is XHR-only → JS-required → breaks that commitment on exactly the catalog/browse pages.
3. **"the ai-app-template" is a ready-made app to drop in.** — Partly. It's a Next.js 16 App-Router monorepo. Its *design system* (~100 components) is near-fully portable to plain Vite/React (only 2 demo components touch `next/*`). But it ships **no client router** and **no Rails-shaped data layer** — those are net-new.

## What would change the recommendation (open decision inputs)

- Does "no backend changes" mean "no new JSON API / keep Devise sessions" (Inertia qualifies) or "do not touch controllers/views at all" (only islands qualify)?
- Is AO3's no-JS guarantee firm for essential guest flows? (If yes → guest catalog can't become an SPA.)
- Is running a 24/7 Node SSR process (for SEO/first-paint) acceptable operationally?
- Goal = "React components inside pages" (islands) or "whole-app React with client-side navigation" (Inertia/SPA)? This single answer picks the architecture.

## Must-not-assume

- Do not assume a JSON API exists (it doesn't, beyond a tiny token-auth v2 import/search surface).
- Do not assume the ai-app-template's Next app shell / data layer is reusable — only its component library and the Shadow-DOM island build recipe are.
- Do not assume no-JS users are negligible — AO3 treats them as a top priority in writing.

## Resolved decisions (user, 2026-07-05)

- **Backend scope:** OPEN to heavier work / backend changes, on two conditions: (1) **functional parity** with the current app must be guaranteed and **continuously verified** against the old one; (2) a **spike** must first prove it's properly possible. → SPA+API and full Inertia are back on the table; the operative constraint is parity + verification, not "don't touch the backend."
- **No-JS gate:** being **DROPPED**. This is a complete reinterpretation/remodernization of AO3. → the no-JS decision gate no longer confines React to authed zones; full React (incl. guest catalog) is viable. Caveat retained: keep SSR + semantic HTML for SEO and baseline accessibility even without the hard no-JS guarantee.
- **Hard requirement:** "maintain the essence and all of its functionality" — parity of features/behavior is the success bar, verified against the live old app throughout.
