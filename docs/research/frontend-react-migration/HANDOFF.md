# AO3 → React/Inertia migration — Handoff

**Branch:** `design/comcom-pass-1` · **Date:** 2026-07-05
**For:** the next agent continuing the full-app conversion.

This is the "what's done / what's next / how to continue" doc. Pair it with
`coverage.md` (the running page-by-page map) and `strategy-memo.md`
(the original research/plan).

---

## 1. What this project is

Convert the entire otwarchive (AO3) Rails frontend to **React via Inertia.js**,
keeping every Rails controller/route/Devise session intact (no separate API, no
backend rewrite). React is the **default**; every converted page keeps its ERB
original reachable at `?ui=legacy` for parity/reference.

The app runs Node-less: a **host build** (bun + vite) compiles the React client
to a static bundle at `public/vite-inertia/inertia.{js,css}`, which the Rails
container serves. There is no live dev server in the container.

---

## 2. The architecture (how a page gets converted)

Four moving parts per page. This is the **entire recipe** — repeat it:

1. **Controller** — add a `render_react` call in the action. One line, guarded so
   ERB still works via `?ui=legacy` and for JS/Atom/XML formats. Example:
   ```ruby
   return if render_react("WorksIndex") do
     WorksIndexPresenter.new(results: @works, owner: @owner, search: @search, heading: @page_subtitle).as_props
   end
   ```
   `render_react` lives in `app/controllers/concerns/inertia_convertible.rb`
   (included in `ApplicationController`). It returns `false` (→ falls through to
   ERB) when `params[:ui] == "legacy"`, for non-HTML formats, or when the block
   yields `nil`.

2. **Presenter (PORO)** — `app/decorators/<name>_presenter.rb`, subclass of
   `InertiaPresenter` (which mixes in Rails URL helpers). Its `as_props` returns
   a plain hash → becomes the React component's props. Reuse the shared helpers
   on the base class (`work_blurb`, `work_stats`, `authors`, `tag_refs`).
   **Make every accessor defensive** (`rescue` / `try`) — the seed DB is sparse
   and blurbs touch a lot of associations.

3. **React page** — `app/frontend/pages/<Name>.tsx`, wrapped in `<AppShell>`.
   Pages **auto-register** via `import.meta.glob("../pages/**/*.tsx")` in
   `app/frontend/entrypoints/inertia.tsx` — just drop the file in, no manifest
   edit. Uses the vendored design system under `app/frontend/design-system`
   (Tailwind v4 CSS-first, shadcn/Base-UI). Component name **must match** the
   string passed to `render_react`.

4. **Parity fixture (optional but recommended)** — add to `spike/parity/`. The
   harness (Playwright-core + linkedom) diffs React vs `?ui=legacy` DOM.

Then **rebuild the bundle** (see §4) and commit `public/vite-inertia/*` with the
source.

Key config: `config/initializers/inertia_rails.rb` sets
`use_script_element_for_initial_page = true` (required — @inertiajs/react 3.6
reads the `<script type="application/json" data-page="app">` element, not the
`data-page` attribute). The Inertia layout is `app/views/layouts/inertia.html.erb`.

---

## 3. What was done in THIS session

### 3a. Fixed "links lead to old ERB pages" (the reported bug)

Several **bare index routes had no owner/search**, so their `render_react` guard
required `@owner && @search` and silently fell through to ERB. These are exactly
the **sidebar links** the user saw going to old pages. Fixed by relaxing the
guard so the presenter (which already degrades gracefully for a plain array) runs:

| Route | Reached from | Before | After |
|---|---|---|---|
| `/works` | Sidebar **Works** | ERB (latest-works) | React `WorksIndex` |
| `/bookmarks` | Sidebar **Bookmarks** | ERB (latest-bookmarks) | React `BookmarksIndex` |
| `/works/search` | Sidebar **Search** | ERB (search form) | React `WorksSearch` (bare form) |
| `/media/:id/fandoms` | Sidebar **Browse** + MediaIndex | ERB | React `FandomsIndex` |
| `/tags` | Tag pages / nav | ERB (tag cloud) | React `TagsIndex` |
| `/users/:login/pseuds` | Profile / pseud pages | ERB | React `PseudsIndex` |

- `WorksController#index` — removed the `@owner.present? && @search.present?`
  guard; presenter handles `owner: nil, search: nil` + plain array (verified via
  Rails: heading "Latest works", 0 facets, page 1/1).
- `BookmarksController#index` — same; presenter's `items` uses `Array(@results)`,
  `facets`→`[]`, `owner_name` nil-safe (verified via Rails with a real array).
  This guard also gated the bookmarkable/tag/collection paths — they now render
  React too.
- `WorksController#search` — added an `elsif` branch so the **bare** search form
  (no `work_search`/`edit_search` params) renders `WorksSearch` with empty
  results. `WorksSearch.tsx` gained a `searched` flag to hide the "0 works found"
  chrome before the first query.

### 3b. Mobile drawer nav buttons → touch-friendly (mobile only)

`app/frontend/components/AppShell.tsx`: `NavItems` and `userRow` gained a
`mobile` variant. Desktop is unchanged (`text-[13px]`, `py-1.5`, `size-18`). The
right-side vaul drawer now uses `mobile`: `text-[15px]`, `px-4 py-3`,
`rounded-xl`, `size-22` icons, larger gaps, `active:bg-muted` press feedback,
plus a roomier drawer (`w-[18rem]`, `p-4`) and larger logo. Matches the "big
tappable rows" reference the user gave.

### 3c. New conversion: moderator tag-set nominations review

`tag_set_nominations#index` (the `/tag_sets/:id/nominations` moderator path) →
`TagSetNominationsIndex.tsx` + `TagSetNominationsIndexPresenter`. One row per
nominator submission with tag badges (approved/rejected/pending) and a
submission-status badge. **Parity caveat:** the ERB groups tag nominations *by
type* with per-type pagination and **inline approve/reject**; the React version
lists *per submission* with **no inline actions** (approve/reject via
`update_multiple` is a documented follow-up). ERB remains at `?ui=legacy`. Built
against an empty DB (shape-verified via a Rails runner, not live rows).

### 3d. Additional index conversions

- `fandoms#index` (`/media/:id/fandoms`) → `FandomsIndex`: fandoms grouped by
  first letter with alphabet nav + work counts. Collection variant keeps ERB.
- `tags#index` (`/tags`) → `TagsIndex`: popular/random freeform tag cloud, sized
  1–8 via the same log-scale as `TagsHelper#tag_cloud`.
- `pseuds#index` (`/users/:login/pseuds`) → `PseudsIndex`: pseud cards with icon,
  byline, work/rec counts, default badge, and owner edit/orphan/delete actions
  (delete via Inertia `router.delete`).

### Current totals

**44 React pages · 40 presenters · 32 controllers wired.** Parity harness 11/11.

---

## 4. How to build, run, and verify

**Build the bundle** (required after any `.tsx`/design-system change):
```bash
cd app/frontend
bunx vite build          # outputs to ../../public/vite-inertia/{inertia.js,inertia.css}
```
`node_modules` lives in `app/frontend/node_modules` (gitignored, 189M). In a
fresh worktree, symlink it: `ln -sfn <main-checkout>/app/frontend/node_modules node_modules`.

**Run / preview:** the app runs in Docker (`otwarchive-web-1`, app at
`127.0.0.1:3013`). The container **bind-mounts the main checkout** at `/otwa`, so
it serves whatever branch is checked out in `/mnt/work/code/personal/otwarchive`
— **not** a worktree. Tailnet preview:
`https://openclaw-vps.tailb0501a.ts.net:8443/`.

**Quick React-vs-ERB check** for any route:
```bash
curl -s http://127.0.0.1:3013/<path> | grep -q 'data-page="app"' && echo REACT || echo ERB
```

**Syntax-check a controller without host ruby:**
```bash
docker exec -i otwarchive-web-1 ruby -c /dev/stdin < app/controllers/foo_controller.rb
```

**Verify a presenter's props** (best sanity check — catches accessor drift):
```bash
docker exec otwarchive-web-1 bin/rails runner 'puts FooPresenter.new(...).as_props.inspect'
```

**Test auth:** `testuser` / `Password1!`. ⚠️ `testuser` is an **archivist
account and cannot give kudos** — verify kudos with a guest session instead.

**⚠️ This session's changes were verified statically** (syntax + presenter props
via Rails + build + page-in-bundle), **not** via live HTTP, because the container
serves the main checkout and the work is isolated in a worktree. **Next agent:
after this branch is checked out in `/mnt/work/code/personal/otwarchive`, smoke
these live:** `/works`, `/bookmarks`, `/works/search`, `/tag_sets/:id/nominations`
(as a moderator) → all should return `data-page="app"`.

---

## 5. What's next (priority order)

### High value, low effort — finish the "broken link" sweep
Remaining ERB routes reachable from converted pages (found via the §4 curl
sweep). `/works`, `/bookmarks`, `/works/search`, `/media/:id/fandoms`, `/tags`,
`/users/:login/pseuds` are **done**. Still ERB:
- `/works/:id/comments` — comment threads (interactive; do with the write-actions
  track, not a plain index).
- `/abuse_reports/new`, `/support`, `/orphans/new` — forms.
- Static content pages (`/tos`, `/tos_faq`, `/privacy`, `/takedown`,
  `/diversity`, `/site_map`, `/donate`, `/about` — all `HomeController`).
  **Skipped deliberately:** low traffic + they render `.landmark` sr-only
  headings and nav partials that depend on AO3 CSS, so a clean React port needs a
  small prose/landmark style shim. Batchable later via `render_to_string(action:,
  layout: false)` → a generic `StaticPage` component.
- **Method:** run the §4 curl sweep over every nav/blurb link, list the ERB ones,
  apply the same guard-relax recipe. Most index pages are 15-minute conversions.

### The advanced works-search form
`WorksSearch.tsx` is a **single query box** — it dropped the ERB advanced form
(fandom/rating/warning/category/crossover/word-count/language/sort filters). The
faceted filters *do* exist on `WorksIndex`, so it's partial parity. To fully
match, port those fields into `WorksSearch.tsx` (the endpoints/params already
flow through `WorkSearchForm`).

### Write actions (interaction parity)
Pattern proven (kudos, subscribe, bookmark-create all POST via Inertia with CSRF
over session). Remaining: comment post/threading, unsubscribe, work
post-to-collection, inbox reply/approve, collection-items moderate, and inline
approve/reject on the nominations page.

### Account settings
Preferences, profile edit, pseud management — form-heavy.

### Large subsystems (batch, mostly parallelizable)
- **Challenges:** challenges, signups, assignments, claims, prompts,
  potential_matches — large, interconnected.
- **Admin:** ~120 admin templates + tag wrangling — low-traffic, do last.

### Enhancement tracks
- Form depth: TinyMCE rich-text + tag autocomplete (endpoints already in props).
- i18n: Rails `t()` → props bridge (currently English strings inline).
- **SSR + cutover:** deploy the Node SSR sidecar (see `docs/adr/0001`), then the
  retire-ERB cutover once parity is broad enough.

**Scope reality:** the full surface is ~700 templates / multi-quarter. This
branch converts the high-/mid-traffic user-facing core and nails the pattern +
infra. The rest is incremental and subagent-parallelizable.

---

## 6. Gotchas / lessons

- **The `@owner && @search` guard is the #1 source of "link goes to old page."**
  When you convert an index, check every branch that assigns the collection
  (owner path, tag/collection path, cached-latest path, bare path). The presenter
  usually already degrades — the guard is what blocks it.
- **Presenters must be defensive.** Sparse seed DB → wrap association reads in
  `rescue`/`try`. Stat accessors drift: use `count_visible_comments`,
  `all_kudos_count`, `public_bookmarks_count` (not `*_count` raw columns).
- **Always rebuild the bundle** after `.tsx` changes and commit
  `public/vite-inertia/*` — it's the served artifact, not a throwaway.
- **Component name string** in `render_react("X")` must equal the `.tsx`
  filename/default-export or Inertia 404s the page.
- **Mobile drawer** is a right-side vaul `Drawer` (`direction="right"`); the
  hamburger is top-right on mobile. Don't add a vaul handle/lip (that's for
  bottom sheets). The fic-reader bottom sheet (`WorkSheet.tsx`) is a *separate*
  CSS-transition sheet, not vaul.
- **Verify against a running container**, not host tools — there's no host ruby;
  `node_modules` is only under `app/frontend`.
