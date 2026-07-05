# React Migration — Build Progress

**Updated:** 2026-07-05. Branch `design/comcom-pass-1`. Tracks `docs/plans/2026-07-05-react-migration-program.md`.

## Done + verified live (committed & pushed)

**Foundation & infra**
- **P0** `InertiaConvertible` concern (React **default**, `?ui=legacy` → ERB baseline, applicability guard) + `inertia_share` flash/currentUser/csrf + `InertiaPresenter` base.
- **P2.1 SSR** — proved JS SSR (renderToString → real HTML); **ADR 0001** decides a standalone Node sidecar (works with unicorn; container stays Node-less), SSR for guest pages only.
- **P2.2 CI parity** — 4 parity suites + `.github/workflows/react-parity.yml`; **11/11 local**.
- **P4.1 nav shell + mobile** — shared responsive `AppShellHeader` (nav + hamburger + user area) across all pages; single-column stacking, no horizontal overflow, filter sidebar collapses on mobile.

**Pages converted (React default, `?ui=legacy` ERB fallback, responsive) — 9 shapes**
| Page | Controller |
|---|---|
| Works index (+ tag/user/pseud/collection/language variants) | `works#index` |
| Work detail | `works#show` (+ full-work / chapter guards) |
| New/Edit work (CRUD, errors-as-props, live-verified create) | `works#new/create/edit/update` |
| Bookmarks index | `bookmarks#index` |
| Collections index | `collections#index` |
| Series index | `series#index` |
| Collection show | `collections#show` |
| User profile / dashboard | `users#show` |

Much of the breadth built by **parallel subagents** at low marginal cost.

## Remaining (pattern proven; incremental)

- **Form depth** — TinyMCE rich-text + tag autocomplete in the work-form (endpoint URLs already passed as props); co-creators/series/collection pickers; per-chapter `chapters#show`.
- **P2.3 i18n** — Rails-I18n→props bridge (pages currently ship English).
- **More P3** — tags/media browse, comments (display+post), write actions (kudos/bookmark/subscribe).
- **P4** — retire ERB per page once prod-confident (keep `?ui=legacy` as the deprecation window), caching/perf parity, admin area.

## Marginal cost per new page (established)

controller one-liner (`render_react`) + a PORO presenter (`< InertiaPresenter`) + a React page (`<AppShellHeader/>` + DS Card/Badge/Button, responsive) + a parity fixture. Subagent-buildable in parallel.
