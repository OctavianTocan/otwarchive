# Converting the AO3 Frontend to React (on the ai-app-template) — Research Memo

**Question:** How can we convert the entire otwarchive frontend to React using the ai-app-template, without redoing the backend?
**Date:** 2026-07-05
**Status:** judged
**Lenses:** otwarchive frontend map · ai-app-template capability map · integration strategies + risks · judge/verification pass

## Executive summary

- **The honest answer: you cannot convert the *entire* frontend to React "without any backend changes" — the constraint and the goal are in tension.** AO3 has **zero JSON views** (722 ERB templates, 0 `.jbuilder`/`.json`), so every path where React consumes data implies *some* backend work; the only truly zero-backend option (mounting React "islands" into ERB) can't deliver whole-app React with client-side navigation. (`app/views` = 722 ERB, 0 JSON; https://inertia-rails.dev/guide/server-side-setup)
- **A hard product gate blocks a full SPA on the public site.** AO3 publicly commits that *essential* features — filtering, searching, downloading — **work without JavaScript** ("One of our top priorities is ensuring that people without JavaScript still have access to essential features, such as filtering, searching, or downloading" — https://archiveofourown.org/faq/accessing-fanworks). Inertia and SPA navigation are **XHR/JS-only** after first paint (https://inertiajs.com/how-it-works), so they structurally break that promise on exactly the catalog/browse pages. An SSR tier fixes first-paint SEO but **does not** restore no-JS navigation.
- **The realistic architecture is a *zoned hybrid*, not a single strategy:** keep server-rendered HTML + **Turbo** for guest-facing catalog pages (preserves no-JS), mount **React islands** (the already-proven Vite IIFE + Shadow-DOM seam) for rich widgets everywhere, and reserve **Inertia.js** for *authenticated, JS-assumed* areas (dashboard, editor, admin, tag-wrangling, challenge management) if/where true SPA feel is wanted.
- **The ai-app-template's value is its component library, not its app.** It's a Next.js 16 monorepo, but the ~100-component shadcn/Base-UI + Tailwind-v4 design system is **near-fully portable** to plain Vite/React — only **2 `docs/` demo components import `next/link`** and `next-themes` (framework-agnostic) is the sole runtime shim. It ships **no client router and no Rails-shaped data layer** — those are net-new. (grep of `design-system`: 2 `next/link`, 0 `next/image`/`next/font`/`next/navigation`; `sidebar.tsx` already runs under Vite.)
- **The proven seam already exists and needs zero backend work.** `public/ao3-island/ao3-sidebar.js` is a Vite IIFE bundle of the design system, mounted into a Shadow DOM in `app/views/layouts/_header.html.erb` with a `:root`→`:host` CSS-var remap. This is the template for scaling islands. (One caveat: it mounts on `turbolinks:load`; confirm Turbolinks/Turbo is actually present or the mount never fires.)
- **Inertia is the only path to a *full* React frontend that keeps Rails routes/controllers/Devise sessions and needs no separate API** — but it is not "no backend changes": every migrated action changes from `respond_to`/ERB to `render inertia:`, you add Vite, and for SEO you must stand up and operate a Node SSR process. (https://inertia-rails.dev/guide/{server-side-setup,responses,server-side-rendering})

## Codebase map

- **Current surfaces (what React would replace/wrap):** 722 ERB templates (293 partials), 41 helpers, 6 decorators, inline Pundit calls in views. ~402 routes over 94 controllers, 174 models. Major areas: works, chapters, series, bookmarks, tags (+wrangling/tag_sets/nominations), collections, comments, kudos, users/pseuds/profiles, subscriptions, inbox, challenges, skins, admin. (`config/routes.rb` 777 lines; `app/controllers/**` = 94)
- **Data representation:** **0 JSON views.** Only 2 XML feed builders (RSS/Atom). No Jbuilder/ActiveModelSerializers. The only API is `app/controllers/api/v2/` — a narrow **token-auth, create+search-only** import surface that skips CSRF. There is **no general read API** for a React client to consume. (`config/routes.rb:564-571`; `api/v2/base_controller.rb:6,15-19`)
- **JS/asset stack:** jQuery 1.9 + jQuery UI 1.10 + TinyMCE, ~28 pre-built static files in `public/javascripts` served `skip_pipeline: true`. Sprockets 3 present but barely used for JS. **No package.json, no importmap/Webpacker/Vite/Stimulus.** Adding React means introducing a build toolchain from scratch — but also means no existing bundler to fight. (`app/views/layouts/_javascripts.html.erb:5-13,60-62`)
- **Auth/sessions:** Devise (forked, users + admin, 2FA) + Pundit; cookie sessions; `protect_from_forgery with: :exception` (`app/controllers/application_controller.rb:4`). A same-origin React client (island or Inertia) can ride existing sessions + the Rails CSRF token; Inertia handles CSRF automatically via the `XSRF-TOKEN` cookie.
- **i18n:** ~3,334 `t(...)` calls across 317 views, multiple shipped languages (en/ru/uk/zh-CN…), PhraseApp in-context editor. Heavily localized server-side — a real, often-underestimated cost across the React boundary.
- **Accessibility/no-JS:** baked into markup — skip links, ARIA landmarks, and `<noscript>` fallbacks in 10+ views (`app/views/layouts/_header.html.erb:1`, `works/_work_header_navigation`, `challenge_signups/_signup_form`, …). Matches AO3's public commitment.
- **Missing primitives for a React frontend:** (1) a JSON/serialization layer; (2) a client router; (3) a Rails-shaped data-fetch layer; (4) a React-side i18n bridge. None exist today.

## Findings by lens

### ai-app-template capability

- **It's two sibling repos.** `cogram-ai-app-template` (the canonical template) and `cogram-agentic-inbox` (a derived instance = the **live source of the current island**). Treat `cogram-agentic-inbox/apps/web` as the seam source of truth, `ai-app-template/apps/web` as the fuller reference. (otwarchive git: `faeb07b2b`, `15b9580fc`)
- **Framework:** Next.js 16 App Router (RSC/SSR), React 19.2, Tailwind v4 CSS-first, TypeScript. **Not** a client SPA. Adopting its *app* means running Node/Next beside Rails; adopting its *design system* does not. (`apps/web/package.json`; `design-system/styles/globals.css:1-17`)
- **Design system:** ~100–102 UI primitives (button, dialog, sidebar, table, data-table, command, form, calendar, chart, tabs, …) on `@base-ui/react` + CVA + lucide. Genuinely complete enough to rebuild AO3 screens. **Portable:** only `docs/card.tsx` & `docs/breadcrumbs.tsx` import `next/link`; `next-themes` is framework-agnostic; `"use client"` directives are inert under Vite. (grep of `design-system/`)
- **Not included:** no client router (`routes/paths.ts` is just string constants), no reusable/Rails-ready data layer (the `lib/chat` + `lib/inbox` transports are Cogram-API-specific and would be discarded), no auth provider (convenient — nothing to strip; use Rails sessions). (`apps/web/src/lib/*`, `app/api/v1/[...path]/route.ts`)
- **ai-ui layer** (~43 files: chat runtime, thread/queue providers, hooks) is chat/agent scaffolding — dead weight for AO3 unless AI features are added.

### Integration strategies

- **Islands (react-rails / react_on_rails / Vite IIFE — already in use):** mount React into ERB via a helper/`<div>`; pass controller ivars as props. **Zero backend changes.** Preserves ERB/SSR HTML and no-JS baseline for un-migrated regions. **Ceiling:** many disconnected React roots, no app-wide client router/navigation; modernizes widgets, not the app shell. (https://github.com/reactjs/react-rails; reactonrails.com/docs — note react_on_rails gates streaming SSR behind a paid Pro license)
- **Turbo / Hotwire (Rails 8 default):** HTML-over-the-wire navigation that **degrades to full page loads with JS off** — the one modernization path that *satisfies* AO3's no-JS commitment while giving JS users SPA-like nav, with React mounted as islands inside Turbo Frames. Not "React everywhere," but the safest spine for guest pages.
- **Inertia.js (inertia-rails + @inertiajs/react):** keep routes/controllers/session-auth, no separate API; swap ERB for React pages via `render inertia:`. **Incremental & page-by-page** (ERB and Inertia coexist; `inertia_rendering?` branches shared layouts). CSRF automatic via `XSRF-TOKEN` cookie. **Costs:** per-action view-layer rewrite (a backend change), add Vite, optional Node SSR tier for SEO, and **JS-required navigation** — disqualifying for guest catalog/filter/search. Best confined to authenticated, JS-assumed zones. (https://inertia-rails.dev/guide/{how-it-works,server-side-setup,responses,csrf-protection,server-side-rendering}; https://inertiajs.com/how-it-works)
- **SPA + JSON API (rejected):** forces serializers + API controllers + API-auth (CORS/token) across the app — rebuilds the backend output contract. Worst no-JS/SEO story. Clear violation of the constraint.
- **One-line dismissals:** *htmx* — great no-JS story, but not React. *Astro partial hydration* — needs a separate frontend server + API. *ViewComponent/Phlex→React* — not a full-React path. *Client SPA* — see rejected above.

## Source quality table

| Source | Tier | Why |
|--------|------|-----|
| `app/views`, `config/routes.rb`, `application_controller.rb`, `_javascripts.html.erb`, `api/v2/*` (repo files) | Tier 1 | Direct evidence of AO3's frontend/auth/API state |
| `cogram-agentic-inbox/apps/web/**`, `ai-app-template/**`, island `entry.tsx`/`vite.config.ts` (repo files) | Tier 1 | Direct evidence of template capability + proven seam |
| https://archiveofourown.org/faq/accessing-fanworks · /about-the-archive | Tier 1 | AO3's own no-JS/accessibility commitment, verbatim |
| https://inertia-rails.dev/guide/* · https://inertiajs.com/how-it-works | Tier 1 | Inertia protocol, setup, CSRF, SSR, incremental coexistence |
| https://github.com/reactjs/react-rails · https://reactonrails.com/docs | Tier 1 | Island helper capabilities + SSR licensing |
| https://evilmartians.com/chronicles/inertiajs-in-rails-... · antiwork/gumroad#3028 | Tier 2 | Maintainer writeup + real page-by-page migration precedent |

## Conflicts and trade-offs

| Topic | Sources disagreeing | Why it matters |
|-------|---------------------|----------------|
| "No backend changes" vs Inertia | user constraint vs inertia-rails setup/responses docs | Inertia rewrites every migrated action's response — a backend change. "No new API" ≠ "no backend changes." |
| No-JS commitment vs React navigation | AO3 FAQ (Tier 1) vs Inertia protocol (Tier 1) | Filtering/searching *are* navigation; Inertia nav is XHR-only → breaks AO3's stated priority on guest pages. Decision gate, not a footnote. |
| README "no API" vs `api/v2` controllers | `README` vs `app/controllers/api/v2` | README is stale; the real API is narrow import/search, not a read API to build on. |
| Turbolinks mount vs no Turbolinks gem | `_header.html.erb:34` vs Gemfile | Island may not actually mount today; confirm the lifecycle before scaling. |

## Premise challenge

- **Load-bearing premise:** "We can convert the *entire* frontend to React without redoing the backend."
- **Evidence for:** the island seam works with zero backend change (`public/ao3-island/*`, `_header.html.erb:17,32`).
- **Evidence against:** 0 JSON views means no data contract for React to consume; Inertia rewrites controller responses; AO3's no-JS commitment forbids SPA-ifying essential guest flows (archiveofourown.org FAQ).
- **Revised premise:** "We can modernize the frontend to the ai-app-template's React design system incrementally — fully in JS-assumed authenticated zones (Inertia), and as islands-inside-server-HTML for guest pages — but the *entire* public frontend cannot become a client-navigated React SPA without either accepting some backend/view-layer changes or breaking AO3's no-JS guarantee."

## Open questions / ambiguities

- Scope of "no backend changes": no-new-API (Inertia OK) vs don't-touch-controllers-at-all (islands only)?
- Is the no-JS guarantee firm for essential guest flows? (Determines whether guest catalog can ever be SPA.)
- Willing to run a 24/7 Node SSR process for SEO?
- Goal = React-inside-pages (islands) or whole-app client-navigated React (Inertia)?
- i18n bridge: expose Rails/PhraseApp translations to React, or reimplement in a JS i18n lib (drift risk across many locales)? No blessed Inertia path exists.

## Recommendation

**Recommended direction: a zoned hybrid, adopted incrementally.**

1. **Design system first (no backend work).** Extract the ai-app-template's design system into a small Vite build that emits both (a) reusable island IIFE bundles and (b) an importable React package. Fix the two `docs/` `next/link` components and provide `next-themes`. This is the shared vocabulary for everything below and needs zero backend change.
2. **Guest-facing catalog (works/chapters/tags/browse/filter/search/download) → keep server-rendered HTML + Turbo, modernize with React islands.** Preserves AO3's no-JS commitment and SEO by default. Replace jQuery widgets with design-system islands one at a time. Zero backend change.
3. **Authenticated, JS-assumed areas (dashboard, new/edit work editor, tag-wrangling, challenge management, admin) → Inertia.js** if/where true SPA feel is wanted. These pages already lean on JS and don't carry the no-JS promise. Accept the per-action `render inertia:` rewrite as scoped, incremental backend work; skip the Node SSR tier here (no SEO need behind auth).
4. **Do not** pursue a full client SPA + JSON API — it violates the constraint and the no-JS commitment hardest.

**Why:** it honors the real constraint spirit (no new API, keep Devise/sessions/business logic), matches AO3's stated product commitments, reuses the already-proven island seam, and lets the team ship page-by-page without a big-bang. It's explicit that "entire public frontend as a React SPA" is not reachable without trade-offs the user should consciously accept.

**Alternatives rejected:** full SPA+API (rebuilds backend contract, worst no-JS/SEO); Inertia everywhere (breaks no-JS on guest pages); islands everywhere (no app-wide navigation/shell — plateaus as widgets).

**Questions before planning (decision-changing):** the four open questions above — especially "no-new-API vs don't-touch-controllers" and "is the no-JS guarantee firm for guest flows," since together they select islands-only vs Inertia-in-auth-zones.

## Judge result

**Status:** Approved with corrections applied.
**Issues resolved:** design-system portability re-verified (only 2 `docs/` components touch `next/*`, not ~100 — alarm dropped); no-JS/Inertia conflict elevated from "tension" to decision gate; Turbo promoted from footnote to recommended spine for guest pages; one-line dismissals added for htmx/Astro/ViewComponent/SPA.
**Remaining gaps:** no blessed i18n path across the Inertia boundary (drift risk across AO3's many locales); Inertia SSR unproven publicly at AO3's traffic scale; confirm whether the current island actually mounts (Turbolinks lifecycle).

---

## Update: recommendation after user decisions (2026-07-05)

Both original constraints relaxed: backend changes are acceptable **if parity is guaranteed and continuously verified**, and the no-JS commitment is being **dropped** (full remodernization). This removes the decision gate that confined React to authed zones and reopens full-frontend approaches.

**Revised recommended direction: Inertia.js as the frontend spine, page-by-page, with SSR + a parity-verification harness.**

Why Inertia over SPA+JSON-API even now that the API path is allowed:
- **Maximal backend reuse = lowest parity risk.** Inertia keeps every Rails route, controller, model, Pundit policy, Devise session, and business rule; only the *view layer* is swapped to React. A JSON-API SPA would reimplement the entire request/response contract as serializers + API controllers — far more surface to drift from the original, directly at odds with the "guarantee parity" requirement.
- **No separate API to build or secure** (no CORS/token/API-auth tier); CSRF is automatic via the `XSRF-TOKEN` cookie.
- **Incremental & reversible.** ERB and Inertia coexist; convert one action at a time behind `inertia_rendering?`, verify parity per page, keep both worlds running until each page passes.
- **Design system ports cleanly** into Inertia+Vite (only 2 `docs/` components + `next-themes` need shims).
- **Add the Node SSR tier this time** — with a public archive you still want first-paint HTML for SEO and accessibility even after dropping the hard no-JS guarantee.

Keep SPA+JSON-API as the fallback only if a hard React/Rails coupling problem surfaces in the spike.

### Proposed spike (what "prove it's properly possible" means)

Goal: de-risk the load-bearing unknowns before committing to a multi-quarter migration. Convert **one guest-facing, interaction-heavy page end-to-end** — the **works index (browse + filter sidebar + search + pagination)** — because it exercises exactly the interactivity that motivated dropping no-JS, and is representative of AO3's hardest coupling.

Spike must demonstrate/measure:
1. `inertia_rails` + Vite install coexists with AO3's constraints: **Rack 2.2 pin**, Sprockets 3, Devise (users + admin), Pundit, and the PhraseApp/i18n pipeline.
2. The works-index controller action renders via `render inertia:` with the same data the ERB view had (ivars → props), reusing existing query/filtering logic unchanged.
3. The ai-app-template design system renders a real AO3 works-index screen (results list + filter facets) in Inertia+Vite, styled to AO3's identity.
4. **i18n bridge**: prove a workable path to feed Rails/PhraseApp translations into React (props-per-page vs shared catalog) — this is the biggest unsolved integration cost.
5. **SSR tier** stands up and serves first-paint HTML for that page (Node ≥22 + Puma plugin), measure ops cost.
6. **Parity harness**: automated old-vs-new comparison (visual snapshot + structured data diff of the results/filters) run against the live old page — the mechanism that satisfies "constantly verify against the old one."

Exit criteria: works-index parity verified old-vs-new, i18n path proven, SSR serving, and a documented per-page conversion recipe + effort estimate for the full ~402-route surface.

### Remaining risks to carry into planning

- **Migration surface is large** (722 templates / ~402 routes / 41 helpers / inline Pundit) — this is a multi-quarter effort regardless of strategy; sequencing and a parity harness are the two things that make it tractable.
- **i18n across the boundary** has no blessed Inertia path — must be solved in the spike.
- **Inertia SSR at AO3 traffic scale** is unproven publicly — the spike measures ops cost but scale validation comes later.
- **PhraseApp in-context editor** and 2FA/Devise edge flows need explicit parity checks.
