# AO3 Surface Modernization — Honest Post-Mortem

**Date:** 2026-07-05
**Status:** Foundation laid, but the result does NOT look like comcom. This document explains why, what was actually done, and what would be required to actually achieve the comcom look.

---

## TL;DR

We ported comcom's **surface treatment** (typography, color palette, shadows, radii, button styles, link styles) into AO3's default and dark skins. The changes are real and verifiable, but they're **subtle on most pages** and don't transform AO3's overall visual identity, because comcom's look comes as much from **layout, structure, density, and component vocabulary** as from surface treatment. AO3's structure (red header bar, dense text navigation, full-width listings) is unchanged and continues to dominate the visual impression.

If the goal was "AO3 with cleaner surfaces and better typography," we succeeded. If the goal was "AO3 that looks like comcom," we delivered maybe 30% of what that would require. Section 4 covers the gap honestly.

---

## 1. What was attempted

Three work streams, in order:

1. **Typography pass** — swap AO3's body face (Lucida → Geist Sans) and display face (Georgia → Redaction, with Redaction 70 for the home-page hero). Committed and live.
2. **Surface modernization** — introduce a CSS-token layer, warm the neutral palette, normalize border-radius, replace inset/skeuomorphic shadows with comcom's layered elevation, flatten gradient buttons, modernize links, wire `.action.primary` / `.action.destructive` variant classes into ERB. 13 tasks, all committed.
3. **Dark mode parity** — override shadow tokens in the dark_mode master and modernize its shadow declarations. Committed to the master file (NOT live in dev DB unless re-imported — see §5).

Plus one drive-by fix: a nil-guard in `fandoms_controller.rb` that was crashing `/fandoms`.

---

## 2. Part 1 — Typography pass (the most visible change)

### Files
- `public/stylesheets/site/2.0/00-fonts.css` (new) — `@font-face` for Geist Sans 400/600/700, Redaction 400/700, Redaction 70 400
- `public/fonts/geist-sans/`, `public/fonts/redaction/`, `public/fonts/redaction-70/` — font binaries (OFL)
- `public/stylesheets/site/2.0/01-core.css` — body → Geist Sans; `.heading` → Redaction
- `public/stylesheets/site/2.0/02-elements.css` — body → Geist Sans; h1–h6 → Redaction; h1 gets `-0.035em` tracking; `.splash h1` gets Redaction 70
- `public/stylesheets/site/2.0/08-actions.css` — `<button>` → Geist Sans
- `public/stylesheets/site/2.0/13-group-blurb.css` — `.prompt .blurb h6`, `.bookmark .user .meta` updated
- `public/stylesheets/site/2.0/21-userstuff.css` — `.userstuff` override restores Lucida (preserves author intent inside work bodies)

### Skin DB record
- Skin id=35 "Archive 2.0: (0) fonts", wired as parent #2 of "Archive 2.0" (after tokens, before core)

### What it delivers
- Page chrome renders in Geist Sans (body) and Redaction (headings)
- Home page hero `<h1>` uses Redaction 70 (the heavy display cut)
- Work bodies inside `.userstuff` keep the original Lucida stack (author intent preserved)
- Both light and dark (dark inherits — it doesn't redeclare fonts)

### This is the single most "comcom-looking" change. If you only look at one thing, look at the typography.

---

## 3. Part 2 — Surface modernization (13 tasks)

### Task 1 — Tokens (`00-tokens.css`, new)
Skin id=36 "Archive 2.0: (0) tokens", parent #1 of Archive 2.0. Defines:
- **Palette**: `--ao3-bg #faf9f6`, `--ao3-fg #151518`, `--ao3-card #ffffff`, `--ao3-muted #f1f0eb`, `--ao3-border #e4e1da`, `--ao3-primary #1e1e22`, `--ao3-destructive #d93b41`, `--ao3-ring #a6a6a9`
- **Radii**: `--ao3-radius-sm 0.25em` (4px), `--ao3-radius-md 0.375em` (6px), `--ao3-radius-lg 0.5em` (8px), `--ao3-radius-xl 0.75em` (12px)
- **Shadows**: 6 elevation tokens (`xs/sm/md/lg/card/popover`), opacities bumped to 0.08–0.12 for visible float (original comcom values 0.06–0.07 were too subtle)
- **Motion**: `--ao3-duration 150ms`, `--ao3-ease cubic-bezier(0.32, 0.72, 0, 1)`

### Task 2 — Palette tint
- `01-core.css:5-7` — body bg/fg → tokens
- `01-core.css:36` — `.blurb`/`fieldset`/`form dl` border → `var(--ao3-border)`
- `02-elements.css:24-26` — body bg/fg → tokens

### Task 3 — Radius normalization (12 replacements + 6 additions)
- Replaced ad-hoc `0.25em`/`0.5em`/`0.15em` values with `var(--ao3-radius-sm/md/lg)` across 12 sites
- Added `border-radius: var(--ao3-radius-lg)` (8px) to 6 card surfaces that previously had sharp corners: `.blurb`, `fieldset`, `form dl`, `.listbox`, `dl.meta`, `.bookmark .user`, `div.comment`, `.secondary`

### Task 4 — Drop shadows → elevation tokens (17 edits across 5 files)
- `03-region-header.css` (2), `07-interactions.css` (9), `08-actions.css` (3), `10-types-groups.css` (1), `22-system-messages.css` (2)
- Each `box-shadow: <ad-hoc value>` → `box-shadow: var(--ao3-shadow-sm|md|lg|popover)`

### Task 5 — Strip inset skeuomorphic shadows (8 edits + 1 focus-ring append)
- 9 inset shadows neutralized across `07-interactions.css`, `08-actions.css`, `11-group-listbox.css`, `22-system-messages.css`, `25-media-midsize.css`, `03-region-header.css` (the deep multi-layer header bevel)
- Appended modern focus-ring rule to `07-interactions.css`: `input:focus, textarea:focus, select:focus { outline: none; border-color: var(--ao3-ring); box-shadow: 0 0 0 3px rgba(166,166,169,0.5); }`

### Task 6 — Card elevation (6 surfaces)
Replaced 1px borders with `--ao3-shadow-card` (the ring + layered drops combo) on:
- `.blurb`, `fieldset`, `form dl` (01-core.css)
- `.listbox` (11-group-listbox.css)
- `dl.meta` (12-group-meta.css)
- `.bookmark .user` (13-group-blurb.css)
- `div.comment` (15-group-comments.css)
- `.secondary` (08-actions.css)

### Task 7 — Flatten gradient buttons
- `08-actions.css:23-47` — main button base block rewritten: deleted 5 vendor-prefixed `linear-gradient` lines + `border-bottom: 1px solid #aaa`; added `background: var(--ao3-muted)`, `cursor: pointer`, `transition: background/border-color/color 150ms`
- `08-actions.css:90-101` — hover/focus/active rewritten: removed `border-top/left: 1px solid #999` and inset shadows; added flat hover (`background: var(--ao3-border)`), `:focus-visible` ring, `:active { transform: translateY(1px) }`
- `03-region-header.css:77-81` — header dropdown menu gradient → `background: var(--ao3-card)`
- `18-zone-searchbrowse.css:199-201, 225-227, 255-257` — 3 filter-checkbox indicator gradients → flat colors (preserving semantic green `#d1f0d1` and red `#efd1d1`)
- `22-system-messages.css:221` — announcement thermometer gradient → `var(--ao3-muted)`

### Task 8 — Button variant classes (appended to 08-actions.css)
- `.action.primary` — `background: var(--ao3-primary)` (near-black), `color: var(--ao3-primary-fg)` (near-white); hover darkens to `#3a3a3e`; focus-visible ring
- `.action.destructive` — `background: rgba(217,59,65,0.10)`, `color: var(--ao3-destructive)`; hover deepens to `0.18` opacity; red focus ring

### Task 9 — Wire `.action.destructive` into ERB (59 sites)
8 subagent commits, one per controller group:
- works/chapters/series (10), bookmarks/readings/collections (5), challenges/prompts/signups/claims (10), comments/tags/tag-sets (5), users/pseuds/profile/sessions (11), inbox/invitations/invite-requests (5), skins/admin-posts/admin (11), wrangling-guidelines/known-issues (2)
- All 59 destructive button call sites now carry `class: "action destructive"` (or `:class =>` for legacy hash-rocket files)
- Skipped: 2 dead-code sites in `external_authors/` (inside HTML comments)

### Task 10 — Wire `.action.primary` into ERB (23 sites)
23 `submit_tag` calls for Post/Save/Update/Create/Submit got `class: "action primary"`. One dual-purpose line (`user_invite_requests/index.html.erb:36`) got BOTH classes — primary for "Update", destructive for "Decline All".

### Task 11 — Modernize links
- `02-elements.css:28-54` — removed the always-on `border-bottom: 1px solid` from links; removed dashed border on `:visited`; added `:hover { text-decoration: underline; text-underline-offset: 2px }`; replaced `outline: 1px dotted` with `:focus-visible { outline: 2px solid var(--ao3-ring); outline-offset: 2px }`
- Kept AO3's red `#900` link color (identity-preserving)
- `21-userstuff.css` — appended `.userstuff a` override restoring the classic dashed-bottom-border treatment inside work bodies (author intent preserved)

### Task 12 — Dark mode shadow modernization (master files only)
- Added `:root` block at top of `public/stylesheets/masters/dark_mode/dark_mode_site_screen_.css` with dark-mode shadow token overrides (comcom inset-bevel technique: `inset 0 1px 0 0 rgb(255 255 255 / 0.04-0.08)` + `rgb(0 0 0 / 0.18-0.22)` drops)
- Deleted 23 redundant per-selector `box-shadow` overrides (now handled by token cascade)
- Rewrote 9 dark-only shadows to use dark tokens
- Eliminated the deep button bevel (`inset 0 -8px 4px #232323, inset 0 8px 7px #555`) — the most skeuomorphic thing in the codebase
- Same treatment for `dark_mode_midsize_.css:13`

### Drive-by fix
- `app/controllers/fandoms_controller.rb:23` — `f.sortable_name[0].upcase` crashed with `NoMethodError` when `sortable_name` was nil. Guarded with `.to_s[0] || "?"`. Pre-existing bug, unrelated to the modernization work.

---

## 4. Why it doesn't look like comcom (honest assessment)

This is the most important section. The changes in §2–3 are real and verifiable, but walking through the result you'd be forgiven for not noticing most of them. Here's why.

### 4a. Surface vs structure
comcom's visual identity comes from **structure** as much as surface:
- **Sidebar app shell** — comcom's logged-in pages have a left sidebar with navigation. AO3 has a top header + centered content + footer.
- **Centered, spacious content** — comcom's content max-widths at ~1100px with generous vertical rhythm. AO3 uses `1em 3em` padding and dense text stacking.
- **Component vocabulary** — comcom has data tables, command palettes, settings cards, dialogs. AO3 has work blurbs, tag clouds, comment threads, meta dl-lists.

I modernized AO3's existing components. I didn't add comcom's components. So you get "AO3's information architecture, rendered with cleaner surfaces" — not "AO3 reimagined as comcom."

### 4b. The red header bar dominates
AO3's `#900` red header with the textured `red-ao3.png` background is the single most identity-defining element on every page. It's still there. comcom's chrome is neutral gray/white with no saturated brand color anywhere. **As long as the red header dominates the top of every page, the visual will read as "AO3" first and any surface treatment second.** I deliberately kept the red because removing it is a much sharper identity decision than the user explicitly making.

### 4c. Density unchanged
AO3 is information-dense: small body text (100% = 16px), tight `0.643em` vertical margins, many links per page, `<ul>`-based navigation everywhere. comcom is spacious: 18px base, generous `gap-4`/`gap-8` spacing, focused single-purpose pages. I didn't touch density. The font swap is the only density-adjacent change (Geist Sans reads slightly larger than Lucida at the same size).

### 4d. Color palette still reads "AO3"
I warmed the neutrals (`#fff` → `#faf9f6`) but AO3's saturated brand red is still everywhere: links (`#900`), the header bar, tag hovers, error states. comcom is essentially monochrome — its "color" is the near-black `#1e1e22` primary. To look like comcom, we'd need to desaturate AO3's red or remove it from chrome entirely. That's a massive identity call I didn't make.

### 4e. Iconography unchanged
comcom uses Lucide icons (SVG, 1.5px stroke, geometric) throughout — buttons, navigation, empty states, the works. AO3 uses a PNG sprite sheet from 2008 (`public/images/imageset.png`) with hand-drawn-style icons. The icon vocabulary alone makes AO3 look like 2010. I didn't touch icons.

### 4f. No motion
comcom's "alive" feel comes from Motion library animations — `LayoutGroup` transitions, `m.div` hover lifts, the `TextShimmer` sweep, `IconMorph` crossfades. AO3 has effectively zero motion (a few jQuery animations). I added a `transition` on buttons (150ms ease) but no enter/exit animations, no hover lifts, no micro-interactions. Motion is half of why comcom feels modern.

### 4g. The home page is the worst case
If you looked at `/` (the home page), you saw the LEAST changed page: it has no `.blurb` cards (so no shadow elevation), few buttons (so little flattening), and the splash section just renders warm bg + Redaction 70 H1. The dramatic changes are on:
- `/works` and `/works/search` — `.blurb` cards float with shadow + 8px radius
- `/works/new` — Post button is high-contrast `.action.primary`, form fieldsets use shadow-card
- Any confirm-delete page — destructive button shows tinted red
- Comment threads — `.comment` cards float

---

## 5. What would actually make it look like comcom

In rough order of impact-per-effort:

| Change | Impact | Effort | Identity risk |
|---|---|---|---|
| **Replace red header with neutral** | Huge — removes the #1 "AO3 tell" | Medium (header ERB + CSS) | High — this IS AO3's brand |
| **Add sidebar layout for logged-in users** | Huge — changes the whole app shell | Large (ERB restructure + new CSS) | Medium |
| **Reduce density: bigger body text, more padding, more whitespace** | Large — modern feel | Medium (touch many CSS files) | Low |
| **Replace PNG sprite with Lucide SVG icons** | Large — kills the 2008 look | Large (icon migration across all ERB) | Low |
| **Desaturate / remove red from chrome (keep only for destructive/error)** | Large — reads monochrome = comcom | Medium | High |
| **Add hover-lift motion to cards** | Medium — "alive" feel | Small (CSS transition on `.blurb:hover`) | Low |
| **Restructure work blurb into a comcom-style card** (image header, meta row, action footer) | Medium — modernizes the core listing | Large (ERB + CSS) | Medium |
| **Add the TextShimmer / skeleton loading states** | Small — AO3 is server-rendered, few loading states exist | Small | Low |
| **Replace Georgia fallback in headings with variable Redaction (more weights)** | Tiny | Small | Low |

The first three (red header, sidebar, density) are where the actual "transformation" lives. Everything I did was table stakes for those changes — without the token layer and flattened surfaces, those structural changes would be even harder. But the token layer alone doesn't transform the look.

---

## 6. How to see what IS there

The dev environment is running. The port `localhost:3000` had a conflict with Cursor earlier (Cursor's dev server was squatting on it) but resolved itself; if you see a Next.js "Pawrrtal" app instead of AO3, that's the conflict.

**Pages worth checking:**

| URL | What to look for |
|---|---|
| `/` | Warm bg, Redaction 70 H1 on the splash module |
| `/works` | `.blurb` cards floating with shadow-card ring + 8px rounded corners; Geist Sans body; tag links hover-underline |
| `/works/new` | (requires login) "Post" button as `.action.primary` (near-black inverted); form fieldsets with shadow-card |
| `/media/Anime%20%26%20Manga/fandoms` | Fandom listing — fixed the nil crash, should render |
| Any confirm-delete page | Destructive button tinted red (`.action.destructive`) |
| Preferences → Skins → Dark Mode | Now **seeded** (Skin records 37/38/39). Toggle to it to see dark-mode shadow work (inset bevels, no skeuomorphic insets). |

**To verify a change is actually applying** (bypassing browser cache), use docker exec:
```bash
docker compose exec web curl -s http://localhost:3000/stylesheets/site/2.0/00-tokens.css | grep "shadow-card"
```

**To see the tokens in DevTools:**
1. Open DevTools → Elements
2. Select `<html>` or `:root`
3. Computed styles → filter `--ao3-`
4. All 25 tokens should resolve

**Hard refresh:** Cmd+Shift+R. AO3's skin cache bumps `skin_cache_version` on every Skin save, so server-side cache shouldn't be stale; browser cache is the more likely culprit.

---

## 7. Known issues and caveats

### 7a. The `Skin.load_site_css` validation bug
`app/models/skin.rb:496` calls `skin.icon.attach(...)` before the `save!(validate: false)` on line 497. `attach` does its own save that runs the `allowed_title` validation, which calls `User.current_user.roles` — and rake tasks have no current_user, so it `NoMethodError`s. Worked around by inserting Skin records directly via `rails runner` (skipping `icon.attach`). Should be reported upstream. Affects: anyone running `rake skins:load_site_skins` against a DB without a superadmin session.

### 7b. 4 empty rulesets in dark_mode master
The subagent that did Task 12 deleted `box-shadow:` lines per my instruction, leaving behind 4 empty selector blocks (e.g., `#header .menu {}`). Harmless dead CSS. Cleanup pass would remove them.

### 7c. Dark mode is seeded but using the MASTER CSS, not the file
The seeded Dark Mode Skin records (37/38/39) read the master CSS into the `css` column at seed time. **If you edit `dark_mode_site_screen_.css` going forward, the seeded Skin does NOT auto-update.** You'd need to re-run the seed script. The Skin `filename` approach (used for default skin site files) doesn't apply here because dark_mode masters are designed to be DB-stored, not file-served.

### 7d. The `icon.attach` workaround means Skin records 35/36 have no preview icon
This is cosmetic (the icon is just a thumbnail in the skin chooser). Doesn't affect rendering.

### 7e. Cursor dev server port conflict
Earlier in the session, Cursor was listening on `localhost:3000`, intercepting requests meant for AO3. Resolved itself, but if it recurs, either stop Cursor's dev server or access AO3 via `http://0.0.0.0:3000` or the machine's LAN IP.

### 7f. `fandoms_controller.rb:23` nil guard
A drive-by fix; `f.sortable_name[0].upcase` → `(f.sortable_name.to_s[0] || "?").upcase`. Root cause is a fandom with empty/nil sortable_name in the dev DB (data issue). The guard is defensive; the data should probably also be fixed but that's out of scope.

---

## 8. File inventory and commit log

### New files
- `public/stylesheets/site/2.0/00-tokens.css` — design tokens
- `public/stylesheets/site/2.0/00-fonts.css` — @font-face declarations
- `public/fonts/geist-sans/{400,600,700}-{normal}.{woff,woff2}` + LICENSE.txt
- `public/fonts/redaction/{400,700}-{normal}.{woff,woff2}` + LICENSE.txt
- `public/fonts/redaction-70/400-{normal}.{woff,woff2}` + LICENSE.txt
- `docs/superpowers/plans/2026-07-05-ao3-surface-modernization.md` — the implementation plan

### Modified CSS (default skin)
- `01-core.css`, `02-elements.css`, `03-region-header.css`, `04-region-dashboard.css`, `07-interactions.css`, `08-actions.css`, `09-roles-states.css`, `10-types-groups.css`, `11-group-listbox.css`, `12-group-meta.css`, `13-group-blurb.css`, `15-group-comments.css`, `16-zone-system.css`, `18-zone-searchbrowse.css`, `21-userstuff.css`, `22-system-messages.css`, `25-media-midsize.css`

### Modified CSS (dark_mode master)
- `masters/dark_mode/dark_mode_site_screen_.css` — token override block + 23 deletions + 9 rewrites
- `masters/dark_mode/dark_mode_midsize_.css` — 1 rewrite

### Modified ERB (~32 files)
~83 ERB edits total: 59 destructive + 23 primary + 1 dual-purpose. See commit log for per-file breakdown.

### Modified Ruby (drive-by)
- `app/controllers/fandoms_controller.rb` — nil guard

### Commit log (newest first)
```
5830be38b fix(fandoms): guard against nil sortable_name in index group_by
384efe343 feat(skin): amplify palette warmth + shadow opacities for visible modernization
8abc57f6c docs(plan): add surface modernization implementation plan
[chore: font binaries + plan committed earlier]
b41f77001 feat(skin): modernize dark-mode shadows via token override + bevel removal
a9a77ab91 feat(skin): modernize chrome links, preserve .userstuff link styling
8dc0540dc feat(views): wire .action.primary on submit buttons
86486cc79 feat(views): wire .action.destructive on wrangling-guidelines/known-issues
b03006bb3 feat(views): wire .action.destructive on skins/admin-posts/admin
566097e17 feat(views): wire .action.destructive on inbox/invitations/invite-requests
80a367f1e feat(views): wire .action.destructive on users/pseuds/profile/sessions
4536e2505 feat(views): wire .action.destructive on comments/tags/tag-sets
84f9c4906 feat(views): wire .action.destructive on challenges/prompts/signups/claims
6e3ebbb90 feat(views): wire .action.destructive on bookmarks/readings/collections
ce4ceaeac feat(views): wire .action.destructive on works/chapters/series
3be93dc11 feat(skin): add .action.primary and .action.destructive variant classes
b8ba9d0ad feat(skin): flatten gradient buttons to muted surfaces with transitions
9de2a26ea feat(skin): replace card borders with --ao3-shadow-card ring elevation
eed97dcd0 feat(skin): strip inset skeuomorphic shadows, add comcom focus rings
b82f0d1ed feat(skin): replace ad-hoc drop shadows with elevation tokens (light)
2c0fd82ee feat(skin): normalize border-radius to token scale, add rounding to cards
e0c0eced7 feat(skin): warm body palette via --ao3-bg/--ao3-fg tokens
7377b32ab feat(skin): add 00-tokens.css with palette/radius/shadow/motion tokens
[earlier: typography pass commits]
```

### Skin DB records created
- id=35 "Archive 2.0: (0) fonts" — typography @font-face
- id=36 "Archive 2.0: (0) tokens" — design tokens
- id=37 "Dark Mode - Screen" — seeded from master
- id=38 "Dark Mode - Midsize" — seeded from master
- id=39 "Dark Mode" — parent, wired to 37+38 as parents

---

## 9. Rollback

Everything is reversible:
- `git revert <commit-sha>` for any individual change
- `git revert HEAD~21..HEAD` to roll back the entire surface modernization (preserve typography pass by stopping at the typography commits)
- The Skin DB records (35, 36, 37, 38, 39) can be left in place even if the files are deleted — they'll just 404 on the `<link>` tags, which is harmless

---

## 10. If you want to push further tomorrow

The highest-leverage next move is **the red header**. Everything else compounds from there. If you decide to keep the red, accept that the result will always read as "modernized AO3" rather than "AO3 looking like comcom" — and that's a legitimate choice (the red IS AO3's brand). But it's a decision worth making consciously rather than by default.

The token layer is in place; the structural changes listed in §5 can build on it. The plan file at `docs/superpowers/plans/2026-07-05-ao3-surface-modernization.md` documents the methodology if you want to write a similar plan for any of those structural changes.
