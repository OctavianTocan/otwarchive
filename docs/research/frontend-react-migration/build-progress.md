# React Migration — Build Progress

**Updated:** 2026-07-05. Branch `design/comcom-pass-1`. Tracks `docs/plans/2026-07-05-react-migration-program.md`.

## Done + verified live (committed & pushed)

| Phase | What | Verification |
|---|---|---|
| **P0** Foundation | `InertiaConvertible` concern (`render_react`: React **default**, `?ui=legacy` → ERB, applicability guard); `inertia_share` flash/currentUser/csrf; `InertiaPresenter` base (work-blurb/tag/stats) | parity 5/5; bare `/works` no-500; shared props present |
| **P1.1** Work-show | Detail page (single + `?view_full_work` multi; adult/chaptered/unrevealed guards preserved; `sanitize_field` parity; scoped work-skin CSS) | single→React, multi→redirect, `?ui=legacy`→ERB; parity 3/3 |
| **P1.2** Work-form | New/edit via Inertia; **validation errors round-trip as props**; multiparam `published_at` + named submit buttons; CSRF over session | invalid POST→errors; **valid POST→created work + redirect to React work-show** |
| **P2.2** CI parity | `harness.mjs`/`workshow.mjs`/`bookmarks.mjs`/`smoke.mjs` + `run.sh` + `.github/workflows/react-parity.yml` | **11/11 local** (index 5 + show 3 + bookmarks 1 + smoke 2) |
| **P3** Bookmarks index | user/pseud faceted path; reuses `work_blurb` for Work bookmarkables | React default, `?ui=legacy` ERB; parity 1/1 |
| **P3** Collections index | ES-faceted; all index variants; status/type badges | React default, 9 collections live |
| **P3** Series index | plain-AR; creators/fandoms/stats | React default, "Test Series" live |

**Seven page shapes converted** (works-index + all owner variants tag/user/pseud/collection/language, work-show, work-form CRUD, bookmarks, collections, series), all React-by-default with the `?ui=legacy` ERB baseline retained. Built partly by parallel subagents at low marginal cost.

## Remaining (pattern proven; each now incremental)

- **P2.1 SSR** — Node sidecar + unicorn-vs-Puma ADR (biggest infra decision; gates public SEO). Not started.
- **P2.3 i18n** — Rails-I18n→props bridge (pages currently ship English).
- **Form depth** — TinyMCE rich-text, tag autocomplete wiring (endpoint URLs already in props), co-creators/series/collection pickers, per-chapter `ChaptersController#show`.
- **More P3** — tags index, comments, user/pseud profile + dashboard; write actions (kudos/bookmark/subscribe/comment).
- **P4 cutover** — app-wide nav shell, remaining filter controls (exclude-facets/autocomplete/date), caching/perf parity, admin area, retire ERB.

## Marginal cost per new page (established)

controller one-liner (`render_react`) + a PORO presenter (`< InertiaPresenter`) + a React page (DS Card/Badge/Button) + a parity fixture. Subagent-buildable in parallel.
