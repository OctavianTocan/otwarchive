# Inertia + ai-app-template Spike — Findings

**Date:** 2026-07-05
**Scope:** Convert `WorksController#index` (tag works browse page) to React via Inertia.js, CSR, param-gated beside the untouched ERB page, styled with the ai-app-template design system. Verify parity against the live ERB page.
**Verdict:** ✅ **GO.** A full React frontend on the existing Rails backend is feasible. One representative, interaction-heavy, coupled page was rebuilt end-to-end with **zero backend logic changed** (one additive gated branch), the ai-app-template design system rendering real data, and **5/5 automated data-parity fixtures passing** against the original ERB page.

## What was proven live

Running at `/tags/:tag/works?ui=react` (e.g. `…/tags/Supernatural/works?ui=react`) beside the untouched ERB page:

- **`inertia_rails` runs in AO3's container** (Rails 8.1, Ruby 3.4.6, **Rack 2.2 pin**, Sprockets `<4`, unicorn/Puma, no Node). `render inertia:` produces the page shell + JSON; XHR navigations return JSON. No dependency conflict.
- **React 19 client mounts** from a host-built static bundle in `public/vite-inertia/` — the Node-less web container never runs a build step (mirrors the existing sidebar-island pattern). SSR intentionally skipped (prod is unicorn, not Puma).
- **The existing ES-backed `WorkSearchForm`/`WorkQuery` results serialize cleanly** into Inertia props via a plain-Ruby presenter (`app/decorators/works_index_presenter.rb`). No query/model changes.
- **The filter sidebar is fully interactive** — facets, sort, completion, word-count, search-within, and pagination re-run the *same* controller action via Inertia GET, with active-state hydrated from the URL.
- **The literal ai-app-template design system renders** (Card/Button/Badge components, Tailwind v4 tokens, AO3 red identity) — only 2 `docs/` components needed skipping; everything vendored cleanly.
- **Automated parity: 5/5 fixtures** (see `spike/parity/`). Data compared: work count, work order, per-work title + words + kudos + comments + bookmarks + hits + language. a11y structural check (landmarks/headings/links/form-controls) captured for both pages.

## Gotchas found (and resolved) — the real integration cost

1. **DOM contract version mismatch.** `@inertiajs/react` 3.6 reads the initial page from a `<script type="application/json">` element; `inertia_rails` defaults to the root div's `data-page` attribute. Fix: `config.use_script_element_for_initial_page = true`. (Symptom: blank page, `Cannot read properties of null (reading 'component')`.)
2. **Node-less container.** `vite_rails` would need Node in the container; instead the client is built on the host and served as a static bundle. Works because `inertia_rails` (the only Ruby-side dep) is Node-independent.
3. **Two filter param namespaces.** The sidebar submits facet include/exclude as `include_work_search[<type>_ids][]` and scalars as `work_search[...]`; a naive `form_for`-only mirror misses the primary mechanism. The React FilterSidebar emits both, and threads `ui=react` through every visit so it never silently falls back to ERB.
4. **Stat accessor drift (caught by the parity harness).** The blurb uses `count_visible_comments`, `all_kudos_count`, `public_bookmarks_count` — not `comments_count`/`kudos_count`/`bookmarks.count`. The harness flagged the discrepancy on 4 works; fixing the presenter took parity 2/5 → 5/5. **This is the headline argument for the parity harness: presentation-logic drift is invisible without it.**
5. **Empty-result + absent-stat normalization.** AO3 omits zero-value stats from ERB HTML; the harness treats absent = 0. `@pagy`/`@facets[type]` can be nil on empty results; the presenter guards.
6. **ES must be indexed.** Dev DB works weren't indexed; `rake search:index_works search:index_tags` (via Resque) was required before either page returned results.

## Per-page conversion recipe

For each page to convert:
1. Add a `params[:ui] == "react"` branch to the controller action → `render inertia: "PageName", props: PagePresenter.new(...).as_props, layout: "inertia"`. Leave the ERB path untouched as the parity baseline.
2. Write a PORO presenter in `app/decorators/` that serializes the action's existing ivars, **using the exact accessors the ERB view/helpers use** (not the "obvious" AR methods — see gotcha 4).
3. Build the React page + components on the vendored design system; thread `ui=react` + context params through every Inertia navigation.
4. Add a parity fixture (URL + params) to `spike/parity/`; iterate presenter/page until data parity is green.

## Effort estimate (extrapolated to the full frontend)

AO3 is ~722 ERB templates / ~402 routes / 94 controllers / 41 helpers. Bucketed by shape:

| Bucket | Rough count | Per-page effort | Notes |
|---|---|---|---|
| List/index (works, bookmarks, tags, collections, comments) | ~30–40 core | ~0.5–1.5 day each once patterns exist | This spike is the hardest of these; reuses one presenter pattern + shared blurb/facet components |
| Detail (work show, chapter, user, tag) | ~30 | ~1–2 days each | Work-show is large (chapters, comments, kudos, associations) |
| Forms (new/edit work, sign-ups, prompts) | ~40+ | ~1–3 days each | Highest effort; validation + rich-text (TinyMCE) + nested params |
| Admin | ~120 templates | ~0.25–0.75 day each | Repetitive, low-traffic; can be batched |

**Order-of-magnitude:** a full conversion is a **multi-quarter effort** (rough range ~9–15 engineer-months) dominated by forms and work-show, *not* by the integration plumbing — which this spike shows is a solved, low-risk, ~1-day setup. The two things that make it tractable at scale: (a) a shared presenter + component library so each page is incremental, and (b) the parity harness as a continuous guardrail (per the user's parity requirement).

## Top follow-ups (not in this spike)

- **SSR/SEO.** Needed for a public archive; requires a Node SSR sidecar and resolving the **prod server (unicorn) vs Inertia's Puma-plugin SSR** mismatch.
- **i18n at scale.** This spike passed a few strings; a full conversion needs a systematic Rails-I18n → props bridge (the ~40–60 strings/page add up across locales).
- **Write actions** (kudos, bookmark, post/edit) — CSRF rides the session cookie automatically, but not exercised here.
- **Exclude-facets + "other tags" autocomplete**, crossover filter, date pickers — the remaining `_filters.html.erb` controls.

## Policy note (important)

Upstream contribution to `otwcode/otwarchive` is **blocked by policy regardless of technical parity**: `CONTRIBUTING.md` accepts "only pull requests for open issues listed on Jira" and states "**we do not accept code generated by AI tools.**" This spike and any resulting migration are therefore a **personal-fork remodernization**, not a path to a canonical AO3 PR. The production controller branch also has no RSpec spec (the parity harness is a separate Node tool, not part of `automated-tests.yml`).

## Artifacts

- `app/frontend/` — Vite + React 19 + Inertia client + vendored design system + `WorksIndex.tsx`.
- `app/decorators/works_index_presenter.rb` — the serialization layer.
- `app/controllers/works_controller.rb` — the one gated branch (`params[:ui] == "react"`).
- `app/views/layouts/inertia.html.erb`, `config/initializers/inertia_rails.rb`.
- `public/vite-inertia/` — host-built static client bundle + CSS.
- `spike/parity/` — the parity harness (`bun harness.mjs`), `report.json`.
