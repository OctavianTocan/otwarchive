# Plan: AO3 Frontend → React Migration Program (Inertia + ai-app-template)

**Date:** 2026-07-05
**Type:** program plan (multi-phase; builds on the works-index spike, commit `cd5855ee8`)
**Complexity:** high (multi-quarter; new frontend architecture, page-by-page with parity)
**Sources:** `docs/research/frontend-react-migration/{spike-findings,strategy-memo,intent}.md`

## Goal

Convert AO3's entire ERB frontend to React (Inertia.js + the ai-app-template design system), keeping the Rails backend, **depth-first**, with continuous parity verification against the retained ERB. React becomes the **default** render for each converted action; ERB stays reachable via `?ui=legacy` as the parity/reference baseline (not a feature flag).

## Architecture & conventions (locked by the spike)

- **Inverted switch:** a converted controller action renders `inertia:` by default; `params[:ui] == "legacy"` renders the original ERB. (Spike used the opposite; P0 flips it.)
- **Presenter per page** in `app/decorators/` (PORO, `Homepage`-style), serializing existing ivars with the **exact accessors the ERB uses** (parity harness enforces this).
- **Frontend** in `app/frontend/` (Vite, React 19, host-built to `public/vite-inertia/`; Node-less container). `inertia_rails` server-side, `use_script_element_for_initial_page = true`.
- **Parity harness** (`spike/parity/` → promoted to `frontend-parity/`) diffs `default` vs `?ui=legacy` per page; runs in CI.

## Program execution order

```
P0 Foundation ──▶ P1 Hard shapes ──▶ P3 Breadth ──▶ P4 Cutover
      │                                   ▲
      └──────────▶ P2 Infra (parallel) ───┘   (SSR decision gates P4; CI/i18n gate P3)
```

---

## P0 — Foundation (invert switch + shared scaffolding)

Small, do first; everything reuses it.

- **P0.1 Invert the render switch.** Change the spike's `if params[:ui]=="react"` to: default → `render inertia:`, `params[:ui]=="legacy"` → fall through to ERB. Add a controller concern `InertiaConvertible` (`app/controllers/concerns/`; precedent: `concerns/tag_wrangling.rb`) exposing `render_react(component) { presenter }` that encapsulates the branch + `layout: "inertia"`. **Applicability guard (critical):** render React only when a presenter can be built for the request — `#index` leaves `@search`/`@owner` nil on the bare `/works` "Latest Works" path (`works_controller.rb:128-134`), so unconditional inertia would 500. The concern renders React when the guard holds, else falls through to ERB; the no-owner path either gets its own minimal presenter or stays ERB for now.
  - *Verify:* `/tags/X/works` **and** bare `/works` **and** a no-owner collection index all return React-or-ERB without 500; `?ui=legacy` returns ERB on each; harness green.
- **P0.2 Extract the design system into a vendored package.** Move `app/frontend/design-system` to a self-contained `app/frontend/design-system/` package with an index barrel; document the vendoring source + update procedure. Expand the vendored set to the primitives P1 needs (add: `checkbox`, `radio-group`, `select`, `dialog`, `tabs`, `tooltip`, `textarea`, `form` label/field, `scroll-area`, `separator`, icons). Keep the `next/*`-free rule.
  - *Verify:* `bunx vite build` clean; a `/spike/kitchen-sink` story route renders each primitive in AO3 tokens.
- **P0.3 Extract shared page scaffolding.** From `WorksIndex.tsx`, factor out reusable pieces: `components/WorkBlurb`, `components/FilterSidebar` (+ `FacetGroup`), `components/Pagination`, and a `shared/AppShell` (topbar/nav + content slot) + `shared/useInertiaFilters` hook (the buildUrl/toggle/go logic). Rewrite `WorksIndex` on them.
  - *Verify:* works-index visually + parity unchanged; the extracted components have no page-specific coupling.
- **P0.4 Presenter base.** Add `app/decorators/inertia_presenter.rb` base (url helpers, `tag_refs`, `blurb` for a Work, i18n-gathering helper) that `WorksIndexPresenter` and future presenters inherit, so blurb/tag serialization is written once.
  - *Verify:* works-index presenter slimmed to page-specific fields; parity green.
- **P0.5 Shared Inertia props (flash + auth + errors).** Add an `inertia_share` block (Rails-side) exposing cross-page props every React page needs: `flash` (notice/error — controllers set these heavily on create/update/destroy), `currentUser` (id/login/pseud or null), and a `csrfToken`. React `AppShell` renders flash; forms read an `errors` prop. This is foundational — P1 forms and every write action depend on it.
  - *Verify:* a flash set by a redirecting action surfaces in the React page; logged-out vs logged-in `currentUser` differs.
- **Commit:** `feat(react): P0 foundation — inverted switch, DS package, shared scaffolding, shared props`

## P1 — Prove the hard shapes (detail + form)

### P1.1 Work-show detail page (`WorksController#show`, and `ChaptersController#show`)
- **Do:** Presenter serializes the work + chapter content (HTML), full associations (tags, series, collections, gifts, related works), stats, and kudos. React `WorkShow.tsx`: work meta header (`@page_title`, not `@page_subtitle`), chapter nav, work/chapter body (sanitized HTML), tag block, kudos display. Reuse `WorkBlurb` tag rendering.
- **Scope reality (from review):** a chaptered work only renders full-work via `#show` when `params[:view_full_work]`/user pref is set; otherwise `#show` **redirects to `ChaptersController#show`** (`works_controller.rb:202-212`). So this step covers single-chapter + explicit "view entire work"; **per-chapter reading is a second conversion (`ChapterShow`)** — include it or explicitly scope to full-work. The React branch must sit **after** the adult-content interstitial (`works_controller.rb:197-199`) and chaptered-redirect guards.
- **Comments** are not preloaded in `#show` (only `@kudos`, `:215`); the thread needs its own data path (CommentsController/partial with pagination), not a straight ivar — read-only this phase, posting is P3.
- **Work skins:** `_work_skin` injects user-authored CSS scoped to `#workskin` — carry that scoping + sanitization into the React body.
- **Verify:** fixtures — a single-chapter work, a multi-chapter work **with `?view_full_work=true`** (else it only tests a redirect), a work with series/collections, a restricted/unrevealed work (Pundit) — data parity on title/tags/stats/chapter text.
- **Commit:** `feat(react): P1 work-show detail page + parity`

### P1.2 New/Edit Work form (`WorksController#new/#edit/#create/#update`)
- **Do:** The hardest shape. Presenter serializes the `Work` form object + all option sets. React `WorkForm.tsx` on DS form primitives + **TinyMCE** for chapter content + **tag autocomplete** (AO3's existing autocomplete JSON endpoints) + series/collection pickers.
- **The crux (from review) — errors are NOT a GET-side one-liner.** On validation failure `create`/`update` call `render :new`/`render :edit` (ERB) at `works_controller.rb:309,314,379,400`. With React as default those branches must be changed to **`render inertia: "WorkForm", props: {..., errors: @work.errors}`** (or adopt Inertia's redirect-back-with-`errors` convention via P0.5 shared props). This edits the failure branches, not just the GET path — name it as the make-or-break work.
- **Form reality:** the form is `_standard_form.html.erb` (+ `_work_form_tags`, `_work_form_pseuds`, `_notes_form`, `_posting_fieldset`, ~546 lines) — not `_work_form`. **Five named submit buttons** (`save_button`/`edit_button`/`preview_button`/`update_button`/`post_button`) drive controller branching — the React submit must send the right one. `published_at` is a **multiparameter date** (`published_at(1i/2i/3i)`, `work_params:943-946`) that Rails expects form-encoded — send those keys explicitly from the JSON submit or post as form-encoded.
- **Timebox** and let findings re-shape P3.3/P4.
- **Verify:** create + edit a work end-to-end matches ERB behavior (same validations fire, same record saved); parity on the rendered form options; a deliberate validation error round-trips.
- **Commit:** `feat(react): P1 new/edit work form (validation, tinymce, autocomplete)`

### P1.3 Foundation refinement
- **Do:** Fold reusable bits discovered in P1.1/P1.2 (form field components, rich-text wrapper, autocomplete hook, error-prop convention) back into `shared/`. Update the presenter base + `InertiaConvertible` if the form flow needed new hooks.
- **Commit:** `refactor(react): promote P1 form/detail patterns into shared scaffolding`

## P2 — Infra (parallel track; gates P3/P4)

### P2.1 SSR sidecar + prod-server decision
- **Do:** Build the Inertia SSR entry (`app/frontend/ssr/ssr.tsx`), host-build an SSR bundle, run a Node SSR process; measure first-paint HTML + ops cost. **Decide prod topology:** unicorn stays + separate Node SSR service (reverse-proxied), or migrate app server to Puma to use `plugin :inertia_ssr`. Write an ADR in `docs/adr/` (new dir; no ADR convention exists yet).
- **Verify:** work-show + works-index return server-rendered HTML on first load (crawlable); measured latency/memory; ADR committed.
- **Commit:** `feat(react): P2 SSR sidecar + prod-server ADR`

### P2.2 CI parity + specs
- **Do:** Promote `spike/parity/` → `frontend-parity/`; parameterize fixtures per converted page; add a CI job (`.github/workflows/`) that boots the app + ES, seeds/indexes, and runs the harness (fail on data-parity regression). Add RSpec request specs asserting each converted action renders Inertia by default and ERB under `?ui=legacy`.
- **Verify:** CI job green on a clean checkout; a deliberately-broken presenter fails CI.
- **Commit:** `ci(react): parity harness + inertia request specs in CI`

### P2.3 i18n bridge
- **Do:** A presenter helper `i18n_props(*keys)` (or auto-collect from a per-page manifest) that resolves Rails/`ts` translations → an `i18n` prop, + a React `useT()` reading it. Convert works-index + work-show + work-form to it. Handle interpolation/pluralization.
- **Verify:** switching `I18n.locale` (e.g. a non-en locale) changes the React strings; no hardcoded English left in the converted pages.
- **Commit:** `feat(react): P2 i18n Rails→props bridge`

## P3 — Scale breadth (reuse the pattern)

Repetitive application of P0/P1 scaffolding; ~0.5–1.5 day/page once patterns exist.

- **P3.1 Index pages:** bookmarks, tags, collections, comments, series indexes — each = controller concern one-liner + presenter (reusing blurb/facet base) + a thin page + parity fixtures.
- **P3.2 Entity pages:** user/pseud profile + dashboard, tag show, collection show, series show.
- **P3.3 Write actions:** kudos, bookmark create/edit, subscribe, comment post — Inertia form submits to existing controllers; CSRF-over-session; optimistic UI optional.
- **Verify (each):** parity fixture added + green in CI before marking done. `log()` any page that can't reach parity for follow-up.
- **Commits:** per bucket, e.g. `feat(react): P3 bookmarks/tags/collections indexes`

## P4 — Cutover & productionize

- **P4.1 App-wide nav shell** replacing the ERB header/footer for converted pages (reuse the island sidebar work); consistent layout across React pages.
- **P4.2 Remaining filter controls:** exclude-facets, "other tags" autocomplete, crossover, date pickers, per-page ERB parity for these.
- **P4.3 Caching + performance parity:** mirror the ERB fragment-cache strategy for presenter output where hot; measure vs ERB.
- **P4.4 Admin area** (batched — ~120 low-traffic templates, repetitive).
- **P4.5 Retire ERB:** once a page's React path is confident in prod, keep `?ui=legacy` for a deprecation window, then remove the ERB templates + the `legacy` branch. Track coverage (converted/total routes).
- **Commits:** per area.

## Risks & mitigations

- **Forms (P1.2) are the make-or-break.** If rich-text/validation/autocomplete parity is hard, it dominates the estimate — timebox P1.2 and let its findings re-shape P3.3/P4.
- **SSR/prod topology (P2.1)** is the biggest infra risk; an ADR + measurement de-risks P4.
- **Parity drift** — every page adds a CI fixture before "done"; no page ships without it (the continuous-verification requirement).
- **Scope/velocity** — P3 is long; sequence by traffic (works/tags/bookmarks first) and `log()` any page that plateaus.
- **Retire-ERB safety** — keep `?ui=legacy` until CI + prod confidence; removal is the last, reversible step.
- **Auth boundary** — `#new/#create` run `users_only`/`check_user_status` that `redirect_to` the (ERB) Devise login for logged-out/suspended users; inertia_rails follows the 302 but lands on ERB login. Converting auth/login pages (or handling the cross-boundary redirect gracefully) is a P3/P4 item, tracked from P0.5's `currentUser` shared prop.

## Out of scope

Upstream PRs (policy-blocked); Rails logic/routes/models/auth changes; ES rewrite; non-AO3 features.

## Review Readiness log

| Gate | Status | Notes |
|------|--------|-------|
| Coherence & architecture critic | pass (after fixes) | 3 blockers folded in: no-owner `/works` applicability guard (P0.1); multi-chapter redirect → ChapterShow scope (P1.1); create/update ERB-error-branch rewrite named as crux (P1.2). Non-blocking (flash shared props → new P0.5, adult/skin guards, comments data path, `@page_title`, `_standard_form` + 5 submit buttons + multiparam date, i18n trails P1, auth boundary) folded. Verified-sound: index inversion mechanics, P0→P1 dep, unicorn-vs-Puma, P3/P4 altitude. |
| project-standards | pass | `concerns/` exists (`tag_wrangling.rb`); `spec/requests` + `spec/controllers` exist (RSpec+factory_bot); parity harness top-level OK (`spec/` is RSpec-only); `docs/adr/` new. |
| engineering-architecture | pass | additive, reversible, page-by-page; only new boundary is the intended Vite/Inertia seam + SSR sidecar (ADR in P2.1). |

## Standards Sources

Spike commit `cd5855ee8`; `app/decorators/homepage.rb` (presenter pattern); `.rubocop.yml`; `CONTRIBUTING.md` (policy); `config/locales/**` + `ts()`; `AdminSetting` (not used — no gate per user).
