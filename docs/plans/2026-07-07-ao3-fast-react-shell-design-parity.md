---
plan: ao3-fast-react-shell-design-parity
created: 2026-07-07
status: draft
execution_mode: undecided
complexity_gate: pass
html_artifact: none
steps: 5
parallel_groups: "Step 1 first; Steps 2, 3, and 4 can run after baseline; Step 5 last."
---

# AO3 Fast React Shell + Design Parity Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. The scratch step files under `.context/plans/` contain the full execution details generated during planning.

**Goal:** Make the AO3 React/Inertia migration feel faster while comparing Inertia and Next.js fairly, then restore stronger AO3 visual parity and borrow useful Cogram design-system patterns without importing Cogram's product identity.

**Architecture:** Rails remains the source of truth for routes, sessions, gates, presenters, and `?ui=legacy` rollback while the performance decision is made. The plan compares two paths: an Inertia/Vite route-splitting path that can ship incrementally, and a disposable Next.js App Router spike that tests whether the benefits justify a larger Rails/frontend boundary. The visible shell work is architecture-independent: AO3 footer/branding parity and Cogram-inspired sidebar/list polish apply to the current React shell either way.

## Overview

The current React migration is already functional but has one major known speed smell: `app/frontend/entrypoints/inertia.tsx` eagerly imports every page, and `app/frontend/vite.config.ts` forces `inlineDynamicImports: true`, producing one large `public/vite-inertia/inertia.js`. This plan first records a baseline, then makes Inertia and Next compete on evidence instead of preference.

The design direction is also explicit. The user chose stronger Cogram visual influence, including persisted/resizable sidebar behavior, but with AO3 identity intact. That means borrowing Cogram's dense operational layout grammar, token discipline, radii/shadow polish, sticky groups, and item-row structure while preserving AO3 colors, archive metadata semantics, legacy fallback behavior, and accessibility expectations. The React footer should return to the original AO3 maroon texture: `#900 url("/images/skins/textures/tiles/red-ao3.png")`. No bundled full wordmark image was found, so branding should use the original AO3 logo image plus visible `Archive of Our Own` text.

## Packages & Files Affected

### Planning and research artifacts

- Create: `docs/research/frontend-react-migration/measure-bundle-sizes.mjs` — repeatable bundle-size reporter.
- Create: `docs/research/frontend-react-migration/measure-route-timings.mjs` — repeatable Playwright route timing reporter.
- Create/modify: `docs/research/frontend-react-migration/baseline/*` — before/after build, timing, and React Doctor outputs.
- Create/modify: `docs/research/frontend-react-migration/baseline-scorecard.md` — weighted Inertia-vs-Next scorecard.
- Create: `docs/research/frontend-react-migration/next-feasibility-spike.md` — durable Next findings.
- Create: `docs/research/frontend-react-migration/performance-decision.md` — final architecture decision.
- Modify: `docs/research/frontend-react-migration/HANDOFF.md` — update migration/runbook implications.

### Inertia/Vite path

- Modify: `app/frontend/entrypoints/inertia.tsx` — lazy page resolution via dynamic imports.
- Modify: `app/frontend/vite.config.ts` — remove single-file output, enable manifest and chunk filenames.
- Modify: `app/views/layouts/inertia.html.erb` — load Vite manifest-backed entry CSS/JS.
- Create: `app/helpers/inertia_assets_helper.rb` — keep Vite manifest parsing out of ERB.
- Test: `test/helpers/inertia_assets_helper_test.rb` if helper behavior is nontrivial.
- Modify: `app/frontend/components/AppShell.tsx` — Inertia links/prefetch plus shell changes.
- Modify: `app/frontend/pages/WorksIndex.tsx`, `app/frontend/pages/WorksSearch.tsx`, `app/frontend/components/shared/PaginationBar.tsx`, `app/frontend/components/shared/FilterSidebar.tsx` — partial reload/prefetch candidates.

### Next.js feasibility path

- Create scratch only: `.context/spikes/next-ao3-feasibility/**` — isolated Next 16 App Router spike, not product code.
- Durable output: `docs/research/frontend-react-migration/next-feasibility-spike.md`.

### AO3 + Cogram shell/design path

- Modify: `DESIGN.md` — record AO3 parity tokens and Cogram influence boundaries.
- Modify: `app/frontend/design-system/styles/globals.css` — footer, sidebar, and warm depth tokens.
- Modify: `app/frontend/components/AppShell.tsx` — legacy AO3 footer color/texture, logo image + visible text, persisted/resizable sidebar.
- Modify: `app/frontend/components/shared/WorkBlurbCard.tsx` — denser Cogram-inspired item grammar rethemed to AO3.
- Modify: `app/frontend/components/shared/PageFrame.tsx` — ensure layout works with sidebar changes.
- Rebuild: `public/vite-inertia/**` — served built assets after frontend changes.

## Execution Order

```text
Step 1: Baseline + scorecard
        ├── Step 2: Inertia acceleration spike
        ├── Step 3: Next feasibility spike
        └── Step 4: AO3 + Cogram shell design
                    └── Step 5: Verification, decision, rollout
```

## Step 1: Baseline + Architecture Scorecard

**Depends on:** none  
**Parallel:** no, run first  
**Detail:** `.context/plans/step-1-baseline-scorecard.md`  
**Summary:** Create repeatable bundle-size and route-timing measurement scripts, capture React Doctor/build baselines, and create the weighted Inertia-vs-Next scorecard. This step is docs/tools only and should not change product behavior.

**Decomposition hint:** straightforward docs/tooling; do this before either architecture spike so later comparisons are meaningful.

## Step 2: Inertia Acceleration Spike

**Depends on:** Step 1 baseline for comparison  
**Parallel:** yes, can run alongside Step 3 and Step 4 after Step 1  
**Detail:** `.context/plans/step-2-inertia-acceleration-spike.md`  
**Summary:** Replace eager Inertia page imports with lazy dynamic imports, change Vite output from one fixed `inertia.js` to manifest-backed entry/chunks, update the Rails Inertia layout/helper to serve split assets, and add low-risk Inertia prefetch/partial reload behavior to the migrated navigation/list surfaces. Keep `?ui=legacy` rollback intact.

**Decomposition hint:** split into build/runtime first, then navigation prefetch/partial reloads. Do not mix Rails asset loading and UI route behavior in one edit.

## Step 3: Next.js Architecture Feasibility Spike

**Depends on:** Step 1 baseline and Step 2 results for final score; scaffold can run in parallel  
**Parallel:** yes after Step 1  
**Detail:** `.context/plans/step-3-next-feasibility-spike.md`  
**Summary:** Build an isolated `.context` Next 16 App Router spike that attempts to consume the existing Rails/Inertia page contract for representative routes, especially `WorkShow`. It answers whether Next can preserve Rails sessions, redirects, TOS/adult gates, CSRF/form behavior, and caching boundaries without a full API rewrite.

**Decomposition hint:** keep this a measurement rig, not a product migration. Durable output is a research memo and scorecard entry, not deployed code.

## Step 4: AO3 + Cogram Shell Design

**Depends on:** Step 1 design baseline; implementation can proceed independently of final Inertia-vs-Next decision if it stays in the current React shell  
**Parallel:** yes after Step 1  
**Detail:** `.context/plans/step-4-ao3-cogram-shell-design.md`  
**Summary:** Update the design contract and shell to restore AO3 visual parity while borrowing Cogram's stronger operational UI grammar. This includes the original AO3 footer maroon/texture, logo image plus visible title text, persisted/resizable desktop sidebar, and denser scan-friendly work rows.

**Decomposition hint:** implement in order: design tokens/doc, footer/branding, sidebar persistence/resize, work-row polish. Run visual QA after each visible area.

## Step 5: Verification, Benchmarking, and Rollout

**Depends on:** Steps 1-4  
**Parallel:** no, run last  
**Detail:** `.context/plans/step-5-verification-rollout.md`  
**Summary:** Run static checks, Vite build, React Doctor, HTTP smoke tests, browser QA, visual QA, route timing measurements, and final scorecard updates. Record the architecture decision and update the handoff so a future agent can run, rollback, and extend the chosen path.

**Decomposition hint:** verification-heavy. Preserve raw outputs under `docs/research/frontend-react-migration/baseline/` where possible.

## Deferred Decisions

| Item | Why deferred | Ceiling | Upgrade trigger |
|------|--------------|---------|-----------------|
| Final Inertia vs Next choice | User requested equal comparison; Step 1-3 gather evidence first | One measured spike per path | Scorecard shows clear performance/risk winner |
| Next.js product migration | Too large to hide inside speed cleanup | Scratch `.context` spike only | Next spike beats Inertia materially and boundary risks are acceptable |
| Full Cogram component import | Cogram identity/product surface does not belong in AO3 | Borrow patterns only | AO3 creates a standalone design-system package with explicit retheme rules |
| Sidebar persistence mechanism | LocalStorage is enough for shell preference | Current browser/session preference only | Need server-side preference sync across devices |

## Architectural Decision Checkpoint

| Candidate decision | Wider impact | Reversibility | Decision path |
|--------------------|--------------|---------------|---------------|
| Vite split chunks + manifest-backed Rails loader | Changes served asset shape and build/run handoff | medium | Decide after Step 2 measurements; rollback to fixed `inertia.js` if needed |
| Next.js App Router shell | Changes frontend ownership, routing, caching, auth/session boundaries | hard | Step 3 feasibility spike; likely ADR if chosen |
| Cogram-style persisted/resizable sidebar | Establishes reusable shell preference pattern | easy-medium | Decide in this plan with localStorage ceiling and trigger for server preference sync |
| AO3 footer/logo parity | User-visible brand restoration | easy | Decide in this plan from legacy CSS/assets |

## Review Readiness

| Gate | Applicability | Outcome | Notes |
|------|---------------|---------|-------|
| project-standards | required | pass-with-concerns | Repo has no local `AGENTS.md`; applied root opencode note, flow/plan, frontend, make-interfaces-feel-better, Context7 docs, and migration handoff. Concern: generated `.context` step files are gitignored scratch and must be copied/consulted during execution. |
| engineering-architecture | required | pass-with-concerns | Plan names the hard decisions and keeps Next isolated until proven. Concern: Vite manifest helper must be tested because it changes runtime asset loading. |
| product-scope | required | pass | User choices are represented: equal comparison, stronger Cogram influence, resizable persisted sidebar, logo image + text. |
| design | required | pass-with-concerns | AO3 footer/logo parity and Cogram boundaries are explicit. Concern: final implementation needs real visual QA at 390/768/1280. |
| testing | required | pass-with-concerns | Verification commands and browser checks are named. Concern: performance scripts are new and should be validated before their numbers drive the final decision. |

**Ready for execution:** yes, with concerns above.

**Concerns ledger:**
- [project-standards] `.context/plans/step-*.md` is scratch; executor must read it in this session or copy needed details into a durable follow-up before running in a fresh session.
- [engineering-architecture] Manifest-backed asset loading is the highest-risk Inertia implementation detail.
- [design] Cogram influence must be rethemed; do not copy its copper/coral palette or AI/inbox product identity.

## Standards Sources

| Area | Source checked | Why relevant |
|------|----------------|--------------|
| Planning process | `flow/plan` skill and `references/writing-plans.md` | Required brainstorm, step breakdown, gates, saved plan format. |
| Review gates | `references/review-gates.md` and selected gate files | Required plan readiness criteria. |
| Frontend/design | `frontend` skill and `make-interfaces-feel-better` skill | UI/design-system/performance work. |
| Current docs | Context7 `/inertiajs/docs`, `/vitejs/vite`, `/vercel/next.js` | Current code splitting, manifest, prefetch, and App Router behavior. |
| AO3 migration conventions | `docs/research/frontend-react-migration/HANDOFF.md` | Rails/Inertia fallback, build artifact, and verification constraints. |
| AO3 design contract | `DESIGN.md` | Existing React migration design tokens and component rules. |
| Cogram reference | `/mnt/work/code/personal/cogram-agentic-inbox/DESIGN.md` and design-system files | Source for transferable visual/interaction grammar. |

## Skill Feedback

| Observation | Owning skill | Action |
|-------------|--------------|--------|
| The plan process wants full step details duplicated into the durable plan, but the generated step files are very large and `.context` is gitignored. | `flow/plan` | defer with trigger: if executing from a new session, copy step details into a durable implementation packet first. |

## Step Details

Full step-detail files generated for this plan:

- `.context/plans/step-1-baseline-scorecard.md`
- `.context/plans/step-2-inertia-acceleration-spike.md`
- `.context/plans/step-3-next-feasibility-spike.md`
- `.context/plans/step-4-ao3-cogram-shell-design.md`
- `.context/plans/step-5-verification-rollout.md`

These files contain exact file paths, code blocks, verification commands, and commit-message suggestions for each step. They remain scratch files by design; this durable plan is the approved execution map.
