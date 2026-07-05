# React Migration — Build Progress

**Updated:** 2026-07-05. Branch `design/comcom-pass-1`. Tracks the program plan `docs/plans/2026-07-05-react-migration-program.md`.

## Done + verified live (committed & pushed)

| Phase | What | Verification | Commit |
|---|---|---|---|
| **P0** Foundation | `InertiaConvertible` concern (`render_react`, React default + `?ui=legacy` ERB, applicability guard); `inertia_share` flash/currentUser/csrf; `InertiaPresenter` base | React default + `?ui=legacy` ERB + bare `/works` no-500; shared props present; parity 5/5 | `110d5cfe8` |
| **P1.1** Work-show | Detail page (single + `?view_full_work` multi-chapter; adult/chaptered/unrevealed guards preserved; sanitize_field parity; scoped work-skin CSS); `WorkShow.tsx` | Single→React, multi→redirect unless full-work, `?ui=legacy`→ERB; parity 3/3 | `e7d27fe53` |
| **P1.2** Work-form | New/edit via Inertia; **validation errors round-trip as props** (create/update failure branches → `render inertia:`); multiparam `published_at` + named submit buttons; CSRF over session | Authed GET→React form; invalid POST→errors-as-props; **valid POST→creates work id=108 + 302 to React work-show** | `e7d27fe53` |
| **P2.2** CI parity | `workshow.mjs` suite, `run.sh`, `.github/workflows/react-parity.yml` | 8/8 local (index 5/5 + show 3/3); CI file needs first-run validation | `4b695d499` |

## In progress

- **P3** Bookmarks index (proving the pattern generalizes to non-works lists) — subagent conversion underway.

## Remaining (pattern proven; each is now incremental)

- **P2.1 SSR** — Node sidecar + unicorn-vs-Puma ADR (biggest infra decision; gates public SEO). NOT started.
- **P2.3 i18n** — systematic Rails-I18n→props bridge. Pages currently ship English; retrofit after.
- **P1/P3 form depth** — TinyMCE (rich-text), tag autocomplete wiring (endpoints already passed as props), co-creators/series/collections pickers, per-chapter `ChaptersController#show`.
- **P3 breadth** — remaining index pages (tags, collections, comments, series), user/pseud/dashboard, write actions (kudos/bookmark/subscribe/comment).
- **P4 cutover** — app-wide nav shell, remaining filter controls, caching/perf parity, admin area, retire ERB (keep `?ui=legacy` until confident).

## Key facts established by the build

- Full toolchain works in the Rack-2.2 / Node-less container; React client host-built to `public/vite-inertia/`.
- **Forms are tractable** (the plan's make-or-break): errors round-trip cleanly through existing controllers; multiparam dates + named buttons handled; CSRF rides the session — no auth rework.
- Marginal cost per page is now: controller one-liner (`render_react`) + a PORO presenter (subclass `InertiaPresenter`) + a React page + a parity fixture.
- The `?ui=legacy` escape hatch + "View legacy page" links keep the ERB reachable for parity/reference/rollback (per requirement).
