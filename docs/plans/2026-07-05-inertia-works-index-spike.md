# Plan: Inertia + ai-app-template React Spike on the AO3 Works Index

**Date:** 2026-07-05
**Type:** feasibility spike (throwaway-quality UI; keep the harness + findings)
**Complexity:** high (new architecture boundary: first Node/Vite toolchain, first Inertia render path, Rack-2/Sprockets coexistence, ES→JSON serialization)
**Strategy source:** `.context/research/frontend-react-migration-memo.md`

## Goal

Answer go/no-go: can AO3's frontend be remodernized to React on the ai-app-template design system via Inertia.js, keeping the Rails backend, with **verifiable parity** against the current pages? Deliver (a) a working React `WorksController#index` at `/tags/:tag/works?ui=react`, CSR-only, param-gated beside the untouched ERB page; (b) an automated parity harness; (c) a findings doc with a per-page conversion recipe and an effort estimate for the ~402-route surface.

## Architecture

Rails keeps routing, `WorksController#index`, `WorkSearchForm`/`WorkQuery` (Elasticsearch), Devise auth, Pundit, and I18n. A new Vite frontend (`app/frontend`) renders an Inertia React page; the same controller action opts into `render inertia:` only when `params[:ui] == "react"`, serializing its existing ivars into JSON props against a fixed TS contract. The ERB view, layout, and all other routes are byte-for-byte unchanged, so the ERB page is the parity baseline.

## Verified compatibility (2026-07)

- `inertia_rails 3.21.2` — deps: `railties >= 6`, Ruby `>= 3.0`. ✓ (AO3 = Rails 8.1 / Ruby 3.4.6)
- `vite_rails 3.11.1` / `vite_ruby` — deps: `rack-proxy ~> 0.6`, `zeitwerk ~> 2.2`; **no `rack`/`railties` pin**. ✓ under `rack ~> 2.2`
- `@inertiajs/react 3.6.0` — peer `react ^19` / `react-dom ^19`. ✓ (design system is React 19.2)
- Sprockets `< 4` coexists: Vite serves its own entrypoints; all existing assets are `skip_pipeline: true` Sprockets, so the two never contend over a manifest (confirmed: no `package.json`/`app/frontend` exists; the `ao3-island` bundle is a hand-committed prebuilt file with no Node project behind it). Integration risk still front-loaded in Step 1.

## Shared prop contract (the Rails↔React interface)

`app/frontend/pages/WorksIndex.tsx` props, produced by the Step-3 presenter:

```ts
interface WorksIndexProps {
  context: { kind: "tag"|"user"|"collection"|"language"|"global";
             ownerName: string|null; heading: string; subtitle: string|null;
             // context hidden fields the sidebar/pagination must re-send on every Inertia visit:
             hidden: Record<string,string> };   // e.g. { tag_id, collection_id, pseud_id, user_id, language_id }
  works: WorkBlurb[];
  pagination: { page: number; pages: number; count: number;
                prevUrl: string|null; nextUrl: string|null;
                pages_urls: { n: number|"gap"; url: string|null }[] };  // presenter synthesizes URLs (pagy gives numbers only)
  facets: FacetGroup[];                 // rating/archive_warning/category/fandom/character/relationship/freeform + query facets
  filters: {                            // current values, to hydrate the sidebar. TWO namespaces (see below):
    include_ids: Record<string, string[]>;   // -> include_work_search[<type>_ids][]
    exclude_ids: Record<string, string[]>;   // -> exclude_work_search[<type>_ids][]
    work_search: Record<string, unknown> };  // -> work_search[...] (scalars: sort_column, crossover, complete, words_from/to, date_from/to, query, language_id)
  i18n: Record<string, string>;         // ~40-60 server-translated strings for this page
  csrfToken: string;
}
interface WorkBlurb { id:number; title:string; url:string;
  authors:{name:string;url:string}[]; anonymous:boolean;
  fandoms:TagRef[]; ratings:TagRef[]; warnings:TagRef[]; categories:TagRef[];
  relationships:TagRef[]; characters:TagRef[]; freeforms:TagRef[];
  summaryHtml:string|null;
  stats:{ language:string; words:number; chapters:string; comments:number; kudos:number; bookmarks:number; hits:number };
  published:string; updated:string; complete:boolean;
  series:{ name:string; url:string; part:number }[] }
interface TagRef { name:string; url:string; type:string }
interface FacetGroup { key:string; label:string;
  items:{ value:string; label:string; count:number; active:boolean }[] }
```

**Critical seam (from review):** the sidebar submits **two param namespaces** — facet include/exclude selections as `include_work_search[<type>_ids][]` / `exclude_work_search[<type>_ids][]` (rating as a radio when >1 rating facet), and scalar controls as `work_search[...]` (matching `form_for @search, as: :work_search`). The controller merges the include/exclude ids into `options[:rating_ids]` etc. **before** building `WorkSearchForm` (`works_controller.rb:70-84`). A React FilterSidebar that only mirrors `form_for` fields would miss the sidebar's primary function. Every Inertia visit (filter submit **and** pagination link) must also re-carry `ui=react` and the `context.hidden` fields, or the controller gate `params[:ui]=="react"` falls through to ERB — which would make the parity harness compare ERB-vs-ERB and **falsely pass**.

## Packages & files affected

**Rails (backend, additive + one gated branch):**
- `Gemfile` — add `inertia_rails`, `vite_rails` (ungrouped, near app gems).
- `app/controllers/works_controller.rb` — `#index`: add `if params[:ui]=="react"` → `render inertia: "WorksIndex", props: WorksIndexPresenter.new(...).as_props, layout: "inertia"`. ERB path untouched.
- `app/decorators/works_index_presenter.rb` — NEW PORO presenter following the existing `app/decorators/homepage.rb` style (`.new(...)` + instance methods, no Draper, no `.call` service pattern). Turns ES QueryResult + facets + pagy + i18n → the contract.
- `app/views/layouts/inertia.html.erb` — NEW layout: reuse `layouts/_header`/`_footer` (verified: neither needs works-index ivars), body = Inertia root + `vite_client_tag`/`vite_typescript_tag "inertia"`.
- `config/vite.json`, `config/initializers/inertia_rails.rb` — via `bin/rails g inertia:install` (CSR mode).

**Frontend (new tree):**
- `package.json`, `vite.config.ts`, `tsconfig.json`, `app/frontend/entrypoints/inertia.tsx` (Inertia client, `createInertiaApp`, CSR — no SSR).
- `app/frontend/design-system/**` — vendored subset from `cogram-agentic-inbox/apps/web/src/design-system` + `styles/globals.css` (Tailwind v4) + `next-themes` (or shim).
- `app/frontend/pages/WorksIndex.tsx` + `app/frontend/components/{FilterSidebar,WorkBlurb,Pagination,FacetGroup}.tsx` + `app/frontend/lib/i18n.ts`.

**Harness / docs (kept, not throwaway):**
- `spike/parity/**` — Playwright config, `works_index.parity.ts`, fixtures, extractors (data + a11y-tree), runner, report. **Not under `spec/`** (that dir is RSpec-only + rubocop-rspec).
- `docs/research/frontend-react-migration/spike-findings.md` — findings, recipe, estimate.

## Execution order

```
Step 1  Toolchain bootstrap (Inertia+Vite boot, hello page)   ── must be first (biggest risk)
   ├─ Step 2  Vendor design-system subset + AO3 theming   ┐ parallel (independent — verified)
   └─ Step 3  Rails presenter + inertia layout            ┘ (both depend only on Step 1)
Step 4  React WorksIndex page (depends on Step 2 + Step 3 contract)
Step 5  Parity harness: data + a11y-tree + screenshot, broad fixtures (depends on Step 4)
Step 6  Findings + per-page recipe + effort estimate (depends on all)
```

## Step Details

### Step 1 — Toolchain bootstrap  *(clears the load-bearing integration risk first)*
- **Do:** Add `inertia_rails`, `vite_rails` to `Gemfile`; `bundle`. Run `bin/rails g inertia:install` choosing React + CSR (no SSR); confirm it creates `package.json`, `vite.config.ts`, `config/vite.json`, `app/frontend/entrypoints/inertia.tsx`, `config/initializers/inertia_rails.rb`. Install JS deps (`@inertiajs/react@3.6.0`, `react@19`, `react-dom@19`, `vite`, `@vitejs/plugin-react`, `tailwindcss@4`). Add a throwaway `GET /spike/hello` → `render inertia: "Hello"` + `app/frontend/pages/Hello.tsx`.
- **Coexistence checks (the point of this step):** `bin/vite build` succeeds with no prior `package.json`; `rails s` (dev, port 3000, Docker bind-mount) boots under **Rack 2.2** with the Vite middleware; a legacy ERB page (`/works`) still loads its Sprockets `skip_pipeline: true` CSS/JS; the vite dev proxy (rack-proxy) doesn't collide with Sprockets.
- **Verify:** `curl -s localhost:3000/spike/hello` returns the Inertia HTML shell (root div + `data-page` JSON); browser shows React "Hello"; `/works` legacy page unaffected.
- **Commit:** `spike(inertia): bootstrap vite_rails + inertia_rails, CSR hello page`
- **Decomp hint:** if `inertia:install` fights Sprockets, fall back to manual `vite_rails` install + hand-written initializer; if Rack 2.2 breaks any middleware, capture the exact error in findings (a go/no-go signal).

### Step 2 — Vendor design-system subset + AO3 theming  *(parallel with Step 3)*
- **Do:** Copy from `cogram-agentic-inbox/apps/web/src/design-system` into `app/frontend/design-system`: `styles/globals.css` + primitives the page needs — `button`, `checkbox`, `radio-group`, `select`, `input`, `label`, `sidebar`, `card`, `badge`, `separator`, `scroll-area`, `collapsible`, plus `lib/utils` (cn). Skip `docs/` (the only `next/link` importers). Add `next-themes` or a small theme shim. Set AO3 tokens (`--background:#FDFCFB`, sidebar tokens, Geist) in a local override layer.
- **Verify:** a scratch story route renders Button/Checkbox/Select/Sidebar in AO3 tokens; `bin/vite build` clean; `grep -r "next/" app/frontend/design-system` → nothing.
- **Commit:** `spike(inertia): vendor ai-app-template design-system subset + AO3 tokens`
- **Decomp hint:** import-chase transitive deps until `vite build` resolves; keep the subset minimal.

### Step 3 — Rails presenter + inertia layout  *(parallel with Step 2)*
- **Do:** Create `WorksIndexPresenter` (PORO à la `app/decorators/homepage.rb`: `WorksIndexPresenter.new(works:, facets:, pagy:, owner:, search:, view_context:, controller:)` + `#as_props`). Build the contract: serialize `@works.items` (real `Work` AR objects, scoped `:for_blurb`) → `WorkBlurb[]`; map `@facets` (`Hash type => [QueryFacet(id,name,count)]`) → `FacetGroup[]` deriving `label` via `label_for_filter` (`tags_helper`) and `active` from current include/exclude ids; `@pagy` → pagination **synthesizing URLs** (pagy exposes page numbers only) with `ui=react` + context hidden fields threaded in; gather the page's I18n strings (via rendered `t`/`ts` set, not a hardcoded list) into `i18n`. **Guards:** `@pagy` is nil on `Pagy::OverflowError`; `@facets[type]` is nil when an aggregation has no buckets (empty-result fixture) — guard both. **Note:** `index_page_title` is a *controller* method (`works_controller.rb:816`), call it on `controller`, not `view_context`. Create `layouts/inertia.html.erb` reusing `_header`/`_footer` with a CSR Inertia root + vite tags. Add the param-gated branch in `#index`.
- **Verify:** `curl -s 'localhost:3000/tags/Some%20Fandom/works?ui=react' -H 'X-Inertia: true'` returns JSON `component:"WorksIndex"` with populated props (works/facets/pagination non-empty for a busy fandom); first-load `curl` returns the HTML shell embedding the same page object; ERB path (no `ui`) byte-unchanged.
- **Commit:** `spike(inertia): works#index react presenter + inertia layout (param-gated)`
- **Decomp hint:** read `app/models/search/query_result.rb` + `query_facet.rb` first to confirm serializable fields; pass `view_context`/`controller`, not raw helper refs.

### Step 4 — React WorksIndex page  *(depends on Step 2 + Step 3)*
- **Do:** Build `WorksIndex.tsx` + components. `FilterSidebar` emits **both** param namespaces — facet include/exclude as `include_work_search[<type>_ids][]` / `exclude_work_search[<type>_ids][]` (rating as radio when >1) and scalars as `work_search[...]` — via Inertia `router.get`, **always re-carrying `ui=react` + `context.hidden`**. Facet groups: rating/archive_warning/category/fandom/character/relationship/freeform (checkbox; rating radio), crossovers, completion, word-count from/to, date-updated from/to, search-within, language select, sort; Clear Filters. `WorkBlurb` (title/authors/required-tags/tags/summary/stats/series); `Pagination` from `pagination.pages_urls` (each URL already carries `ui=react`). Reimplement the ~13 view helpers as small TS fns. All copy via `i18n` prop. Interface-only JSDoc, no comment-spam (repo + user rule).
- **Verify:** `/tags/:tag/works?ui=react` shows a real fandom's works, correct counts, facets with counts; ticking a rating + submit reloads via Inertia (stays on the React page, does NOT hard-nav to ERB) with filtered props; pagination navigates within Inertia; logged-out and logged-in both render (read-only). Cosmetic: `#ao3-sidebar` island stays empty on the React page (no Turbolinks) — expected, not a bug.
- **Commit:** `spike(inertia): WorksIndex react page — filter sidebar (both namespaces), blurbs, pagination`
- **Decomp hint:** read `_filters.html.erb:1,20-72,126-180` for exact field names + the `include_work_search`/`exclude_work_search` tag naming; this is where drift hides.

### Step 5 — Parity harness  *(depends on Step 4)*
- **Do:** Playwright project in `spike/parity/`. Fixtures: busy fandom, empty result, filtered query (rating+complete), page 2, multi-fandom crossover, edge filters (word-count range, date range). For each: load the ERB URL and the `?ui=react` URL; **first assert the React response actually stayed Inertia** (root `#app` + `data-page` present) so a fallback-to-ERB can't false-pass; then extract **structured data** (work count, ordered blurb titles+authors+stat numbers, facet group labels + item labels + counts, active filters, pagination state) and the **accessibility tree** (`page.accessibility.snapshot()`), plus a screenshot. Normalize before diffing (whitespace, absolute vs relative URLs, transient hit counts). Diff data + a11y-tree (hard gates) + screenshot (advisory). Emit a per-fixture pass/fail report with diffs.
- **Verify:** `npx playwright test` (config in `spike/parity/`) runs green where the React page is faithful and produces a readable diff where it isn't; the report lists every mismatch and every normalization applied.
- **Commit:** `spike(inertia): playwright parity harness — data + a11y-tree + screenshot`
- **Decomp hint:** the ui=react-stayed-Inertia assertion is the guard against the false-pass failure mode the review flagged.

### Step 6 — Findings, recipe, estimate  *(depends on all)*
- **Do:** Write `docs/research/frontend-react-migration/spike-findings.md`: go/no-go verdict; what worked / broke (Rack-2 + Sprockets + Vite coexistence, ES→JSON serialization effort, the two-namespace filter contract, i18n-via-props ergonomics, helper-reimplementation cost, parity fidelity achieved incl. a11y-tree); the **per-page conversion recipe** (controller branch → presenter → page → parity fixture); and an **effort estimate** extrapolated to ~402 routes / 722 templates (bucket pages by shape — list/detail/form/admin — per-bucket multiplier + total range). **State plainly:** upstream contribution to otwcode is **policy-blocked regardless of parity** — CONTRIBUTING.md accepts "only PRs for open Jira issues" and "we do not accept code generated by AI tools" — so this line of work stays on the personal fork; the estimate is not a path to a real AO3 PR. Note the production controller branch has no RSpec spec (parity harness is not a request spec, won't run in `automated-tests.yml`). Note SSR/SEO as the top follow-up with the unicorn-vs-Puma decision.
- **Verify:** doc checked against the brainstorm's exit criteria; parity report referenced with real numbers.
- **Commit:** `docs(spike): inertia works-index spike findings, recipe, estimate`

## Risks & mitigations

- **Vite × Sprockets<4 × Rack 2.2 coexistence** — highest risk; front-loaded in Step 1 with explicit checks; a hard failure is itself a go/no-go finding.
- **Two-namespace filter contract** — the sidebar's real submission mechanism; Step 3/4 handle `include_work_search`/`exclude_work_search` + `work_search` explicitly; parity harness catches residual drift.
- **Silent ERB fallback false-pass** — every Inertia visit threads `ui=react`; Step 5 asserts the response stayed Inertia before diffing.
- **Nil `@pagy`/`@facets[type]` on empty results** — Step 3 guards; empty-result fixture exercises it.
- **ES `QueryResult`/`facets` serializability** — verified against models (items = AR Works; `QueryFacet = Struct(id,name,count)`); presenter derives label/active.
- **i18n surface larger than 3 files** — Step 3 collects from the rendered string set, not a hardcoded list.
- **Throwaway scope creep** — UI polish out; parity (not beauty) is the gate.

## Out of scope

SSR/SEO (documented follow-up), any write action, other routes, full DS, production feature-flagging, caching parity, PhraseApp in-context editor, touching the ERB works-index view, and any upstream PR (policy-blocked).

## Review Readiness log

| Gate | Status | Notes |
|------|--------|-------|
| Coherence & architecture critic | pass (after fixes) | 2 blocking issues fixed into plan: two-namespace filter submission; `ui=react` threading + false-pass guard. Non-blocking (nil `@pagy`/`@facets`, synthesized pagination URLs, `index_page_title` is a controller method, empty island) all folded into Step 3/4. Verified sound: Step-1 coexistence premise, prop contract vs models, facet key list, Step2⟂Step3 parallelism, layout partial reuse, tag-route always sets `@owner`. |
| project-standards | pass-with-concerns | Fixed: presenter → `app/decorators/` PORO (`Homepage` style), harness → `spike/parity/` not `spec/`. Concerns recorded in Step 6: upstream policy-blocked (Jira-only + no-AI-code), production controller lacks RSpec spec, keep presenter rubocop-clean (`TargetRubyVersion 3.1`). i18n-via-props + additive gated branch confirmed aligned. |
| engineering-architecture | pass | Additive, reversible, single gated branch; no new cross-system boundary beyond the intended Vite/Inertia seam, which is the spike's subject. ERB baseline preserved byte-for-byte. |

## Standards Sources

- `app/decorators/homepage.rb` (PORO presenter pattern), `.rubocop.yml` (rubocop-rspec over `spec/`, `TargetRubyVersion 3.1`), `spec/spec_helper.rb` (RSpec+FactoryBot), `.github/PULL_REQUEST_TEMPLATE.md` + `CONTRIBUTING.md` (Jira-issue-only, no AI-generated code), `config/locales/**` + `ts()`/`t()` usage, `Gemfile:11-12` (rack/sprockets pins).

## Skill Feedback

`no update` — flow/plan and flow/research references applied as written; no gaps surfaced.
