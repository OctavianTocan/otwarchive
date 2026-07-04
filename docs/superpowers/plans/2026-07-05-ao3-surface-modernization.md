# AO3 Surface Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port comcom's surface treatment — warm-neutral palette, layered elevation shadows, normalized radius scale, flattened buttons, modernized links, button variant classes wired into ERB — into AO3's default "Archive 2.0" skin and the dark_mode master.

**Architecture:** Introduce a CSS-custom-property token layer (`00-tokens.css`) as the single source of truth for palette/radius/shadow/motion. Replace ad-hoc values across the default skin's numbered CSS files with token references. Flatten gradient buttons and inset skeuomorphic shadows. Override shadow tokens inside `dark_mode_site_screen_.css` so dark parity comes from cascade (dark_mode's role behaves as `user`, layered after default — confirmed via Skin.get_style at skin.rb:351-358). Wire `.action.primary` and `.action.destructive` into ~73 ERB call sites. All changes reversible via `git revert` + one DB re-sync.

**Tech Stack:** Plain CSS, CSS Custom Properties, Ruby on Rails ERB, AO3 Skin model (DB-driven). No build step.

---

## File Structure

| File | Purpose | Phase |
|---|---|---|
| **Create** `public/stylesheets/site/2.0/00-tokens.css` | `:root` token definitions (palette, radius, shadow, motion) | 0 |
| **Modify** `public/stylesheets/site/2.0/01-core.css` | Body bg/fg + `.blurb`/`fieldset`/`form dl` border → shadow-card | 1, 2, 3b |
| **Modify** `public/stylesheets/site/2.0/02-elements.css` | Body bg/fg, link rewrite | 1, 5 |
| **Modify** `public/stylesheets/site/2.0/03-region-header.css` | Header shadow tokens, dropdown gradient removal | 3a, 4 |
| **Modify** `public/stylesheets/site/2.0/04-region-dashboard.css` | Radius token | 2 |
| **Modify** `public/stylesheets/site/2.0/07-interactions.css` | Strip inset shadows, focus rings | 3c |
| **Modify** `public/stylesheets/site/2.0/08-actions.css` | Button restyle, variant classes, `.secondary` shadow | 3a, 3b, 4a, 4d |
| **Modify** `public/stylesheets/site/2.0/09-roles-states.css` | Radius token | 2 |
| **Modify** `public/stylesheets/site/2.0/10-types-groups.css` | `.wrapper` shadow token | 3a |
| **Modify** `public/stylesheets/site/2.0/11-group-listbox.css` | `.listbox` shadow-card + strip inset | 3b, 3c |
| **Modify** `public/stylesheets/site/2.0/12-group-meta.css` | `dl.meta` shadow-card | 3b |
| **Modify** `public/stylesheets/site/2.0/13-group-blurb.css` | `.bookmark .user` shadow-card | 3b |
| **Modify** `public/stylesheets/site/2.0/15-group-comments.css` | `div.comment` shadow-card | 3b |
| **Modify** `public/stylesheets/site/2.0/16-zone-system.css` | Radius token | 2 |
| **Modify** `public/stylesheets/site/2.0/18-zone-searchbrowse.css` | Flatten 3 filter-indicator gradients | 4b |
| **Modify** `public/stylesheets/site/2.0/21-userstuff.css` | `.userstuff a` override (preserve AO3 link style in work bodies) | 5 |
| **Modify** `public/stylesheets/site/2.0/22-system-messages.css` | Flatten `.announcement` gradient button, radius tokens | 2, 4c |
| **Modify** `public/stylesheets/site/2.0/25-media-midsize.css` | Strip inset shadow, radius token | 2, 3c |
| **Modify** `public/stylesheets/masters/dark_mode/dark_mode_site_screen_.css` | `:root` shadow-token overrides + delete redundant overrides + modernize dark-only shadows | 3d |
| **Modify** `public/stylesheets/masters/dark_mode/dark_mode_midsize_.css` | Modernize dark-only shadow at :13 | 3d |
| **Modify** ~32 ERB files in `app/views/` | Add `class: "action destructive"` (49 sites) and `class: "action primary"` (24 sites) | 4e |

~17 CSS files + 1 new CSS + 1 dark master + 1 dark midsize + ~32 ERB files. ~73 ERB edits total.

---

## Task 1: Create tokens file + register Skin record

**Files:**
- Create: `public/stylesheets/site/2.0/00-tokens.css`
- DB: insert one Skin record (via `rails runner`, idempotent, works around the `icon.attach` validation bug documented earlier)

- [ ] **Step 1: Write the tokens file**

```css
/* public/stylesheets/site/2.0/00-tokens.css */
/* == TOKENS: design tokens for the Archive 2.0 surface modernization
   Single source of truth for palette, radius, shadow, motion.
   Dark-mode shadow overrides live in masters/dark_mode/dark_mode_site_screen_.css.
*/

:root {
  /* Palette — warm neutral, flattened from comcom OKLCH hue 85 */
  --ao3-bg: #fcfcfb;            /* was #fff — body background */
  --ao3-fg: #151518;            /* was #2a2a2a — body text */
  --ao3-card: #ffffff;          /* pure white — card surfaces (intentional contrast with --ao3-bg) */
  --ao3-muted: #f4f4f2;         /* muted surface (subtle hover, secondary buttons) */
  --ao3-muted-fg: #7a7a7d;      /* muted text */
  --ao3-border: #ededec;        /* hairline borders */
  --ao3-border-strong: #d8d8d6; /* darker hairline (inputs, emphasis) */
  --ao3-primary: #1e1e22;       /* primary button bg (near-black) */
  --ao3-primary-fg: #fcfcfb;    /* primary button text */
  --ao3-destructive: #e5484d;   /* destructive accent (Radix red 9) */
  --ao3-destructive-fg: #151518;
  --ao3-ring: #a6a6a9;          /* focus ring */

  /* Radii — em-based to scale with font-size (matches AO3 convention) */
  --ao3-radius-sm: 0.25em;   /* 4px — buttons, inputs, badges */
  --ao3-radius-md: 0.375em;  /* 6px — small chips */
  --ao3-radius-lg: 0.5em;    /* 8px — cards, fieldsets (comcom default) */
  --ao3-radius-xl: 0.75em;   /* 12px — large surfaces */

  /* Elevation — comcom layered shadows (light mode) */
  --ao3-shadow-xs: 0 1px 1px -0.5px rgb(0 0 0 / 0.06);
  --ao3-shadow-sm: 0 1px 1px -0.5px rgb(0 0 0 / 0.06), 0 2px 2px -1px rgb(0 0 0 / 0.06);
  --ao3-shadow-md: 0 1px 1px -0.5px rgb(0 0 0 / 0.08), 0 2px 2px -1px rgb(0 0 0 / 0.08), 0 4px 4px -2px rgb(0 0 0 / 0.08);
  --ao3-shadow-lg: 0 1px 1px -0.5px rgb(0 0 0 / 0.1), 0 3px 3px -1.5px rgb(0 0 0 / 0.1), 0 6px 6px -3px rgb(0 0 0 / 0.1);
  --ao3-shadow-card: 0 0 0 1px rgba(0,0,0,0.07), 0 1px 1px -0.5px rgba(0,0,0,0.06), 0 3px 3px -1.5px rgba(0,0,0,0.06), 0 6px 6px -3px rgba(0,0,0,0.03), 0 12px 12px -6px rgba(0,0,0,0.02), 0 24px 24px -12px rgba(0,0,0,0.03);
  --ao3-shadow-popover: 0 0 0 1px rgba(0,0,0,0.08), 0 4px 6px -1px rgba(0,0,0,0.08), 0 10px 15px -3px rgba(0,0,0,0.08);

  /* Motion */
  --ao3-duration: 150ms;
  --ao3-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --ao3-ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
}

/* END == */
```

- [ ] **Step 2: Register the Skin record (idempotent)**

Run from `/Users/octaviantocan/projects/otwarchive`:
```bash
docker compose exec web bundle exec rails runner "
  tokens = Skin.find_or_initialize_by(title: 'Archive 2.0: (0) tokens')
  tokens.filename = 'stylesheets/site/2.0/00-tokens.css'
  tokens.description = 'Version 2.0 of the tokens component (0) of the default archive site design.'
  tokens.public = true
  tokens.official = true
  tokens.role = 'site'
  tokens.media = ['screen']
  tokens.ie_condition = ''
  tokens.unusable = true
  tokens.cached = false
  tokens.save(validate: false)
  puts \"tokens skin id=#{tokens.id}\"

  top = Skin.find_by!(title: 'Archive 2.0')
  existing = top.skin_parents.find_by(parent_skin_id: tokens.id)
  if existing
    puts \"already wired at position #{existing.position}\"
  else
    ActiveRecord::Base.transaction do
      top.skin_parents.order(:position).each { |sp| sp.update_column(:position, sp.position + 1) }
      top.skin_parents.create!(parent_skin: tokens, position: 1)
      top.clear_cache! if top.cached?
    end
    puts 'inserted tokens at position 1'
  end
"
```

Expected: `tokens skin id=N`, then `inserted tokens at position 1` (or `already wired` on re-run).

- [ ] **Step 3: Verify the cascade picked it up**

```bash
curl -s --max-time 20 http://localhost:3000/ -o /tmp/ao3_home.html
grep -c '00-tokens.css' /tmp/ao3_home.html   # Expected: 1
grep -c '00-fonts.css' /tmp/ao3_home.html    # Expected: 1
```

- [ ] **Step 4: Commit**

```bash
git add public/stylesheets/site/2.0/00-tokens.css
git commit -m "feat(skin): add 00-tokens.css with palette/radius/shadow/motion tokens"
```

---

## Task 2: Apply palette tint (Phase 1)

**Files:**
- Modify: `public/stylesheets/site/2.0/01-core.css:5-7` (body bg/fg)
- Modify: `public/stylesheets/site/2.0/01-core.css:35-39` (`.blurb`/`fieldset`/`form dl` border color)
- Modify: `public/stylesheets/site/2.0/02-elements.css:24-26` (body bg/fg)

- [ ] **Step 1: `01-core.css` body block**

Replace:
```css
body, .toggled form, .dynamic form, .secondary, .dropdown {
  background: #fff;
  color: #2a2a2a;
```
With:
```css
body, .toggled form, .dynamic form, .secondary, .dropdown {
  background: var(--ao3-bg);
  color: var(--ao3-fg);
```

- [ ] **Step 2: `01-core.css` card border**

Replace:
```css
li.blurb, fieldset, form dl {
  border: 1px solid #ddd;
  padding: 1em;
  overflow: hidden;
}
```
With:
```css
li.blurb, fieldset, form dl {
  border: 1px solid var(--ao3-border);
  padding: 1em;
  overflow: hidden;
}
```

- [ ] **Step 3: `02-elements.css` body block**

Replace:
```css
body {
  font: 100%/1.125 'Geist Sans', 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Helvetica, sans-serif, 'GNU Unifont';
}
```
With:
```css
body {
  font: 100%/1.125 'Geist Sans', 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Helvetica, sans-serif, 'GNU Unifont';
  background: var(--ao3-bg);
  color: var(--ao3-fg);
}
```

- [ ] **Step 4: Verify and commit**

```bash
curl -s http://localhost:3000/stylesheets/site/2.0/01-core.css | grep -E "var\(--ao3-(bg|fg|border)\)" | wc -l
# Expected: 3
git add public/stylesheets/site/2.0/01-core.css public/stylesheets/site/2.0/02-elements.css
git commit -m "feat(skin): warm body palette via --ao3-bg/--ao3-fg tokens"
```

---

## Task 3: Normalize border-radius (Phase 2)

**Files:** 9 CSS files, 22 declarations. Plus add radius to 6 card surfaces.

- [ ] **Step 1: Replace ad-hoc values with tokens**

| File:Line | Selector | Old | New |
|---|---|---|---|
| `03-region-header.css:128` | `#header .user a:hover, #header .user a:focus` | `0.25em` | `var(--ao3-radius-sm)` |
| `04-region-dashboard.css:57` | `#dashboard.own` | `0.25em` | `var(--ao3-radius-lg)` |
| `07-interactions.css:203` | `.LV_invalid` | `0.25em` | `var(--ao3-radius-sm)` |
| `08-actions.css:45` | (button base) | `0.25em` | `var(--ao3-radius-sm)` |
| `08-actions.css:157` | `.secondary` | `0.15em` | `var(--ao3-radius-md)` |
| `09-roles-states.css:13` | `.draft` | `0.5em` | `var(--ao3-radius-lg)` |
| `09-roles-states.css:33` | `span.unread, .replied, ...` | `0.25em` | `var(--ao3-radius-sm)` |
| `16-zone-system.css:127` | `.splash .module div.account` | `0.5em` | `var(--ao3-radius-lg)` |
| `18-zone-searchbrowse.css:219` | `.filters [type="checkbox"] + .indicator:before` | `0.25em` | `var(--ao3-radius-sm)` |
| `22-system-messages.css:29` | `div.error` | `0.25em` | `var(--ao3-radius-sm)` |
| `22-system-messages.css:39` | `.notice, .comment_notice, ...` | `0.25em` | `var(--ao3-radius-sm)` |
| `25-media-midsize.css:18` | `#dashboard, #dashboard.own` | `0.25em` | `var(--ao3-radius-lg)` |

Leave alone: pill-shaped (`0.875em`, `1em`, `2em`), radio circles, tab-shape partial corners, `0.75em` symbol glyph.

- [ ] **Step 2: Add `border-radius: var(--ao3-radius-lg);` to card surfaces**

Insert into existing rule (or add a new declaration line) in each file:

| File:Line | Selector |
|---|---|
| `01-core.css:35-39` | `li.blurb, fieldset, form dl` (already has border touched in Task 2) |
| `11-group-listbox.css:8` | `.listbox, fieldset fieldset.listbox` |
| `12-group-meta.css:6` | `dl.meta` |
| `13-group-blurb.css:340` | `.bookmark .user` |
| `15-group-comments.css:17` | `div.comment, li.comment` |
| `08-actions.css:151` | `.secondary` |

- [ ] **Step 3: Verify and commit**

```bash
grep -c "border-radius: var(--ao3-radius" public/stylesheets/site/2.0/01-core.css public/stylesheets/site/2.0/08-actions.css public/stylesheets/site/2.0/11-group-listbox.css public/stylesheets/site/2.0/12-group-meta.css public/stylesheets/site/2.0/15-group-comments.css
# Expected: at least 1 per file
git add public/stylesheets/site/2.0/
git commit -m "feat(skin): normalize border-radius to token scale, add rounding to cards"
```

---

## Task 4: Replace drop shadows with elevation tokens (Phase 3a — light)

**Files:** 7 CSS files, 18 drop shadows.

| File:Line | Old | New |
|---|---|---|
| `03-region-header.css:76` | `1px 1px 3px -1px #444` | `var(--ao3-shadow-sm)` |
| `03-region-header.css:141` | `-1px 1px 3px -1px #444` | `var(--ao3-shadow-sm)` |
| `07-interactions.css:202` | `1px 1px 2px` | `var(--ao3-shadow-sm)` |
| `07-interactions.css:230` | `1px 3px 5px rgba(0, 0, 0, 0.5)` | `var(--ao3-shadow-lg)` |
| `07-interactions.css:283` | `1px 1px 3px #bbb` | `var(--ao3-shadow-sm)` |
| `07-interactions.css:302` | `0 0 3px #555` | `var(--ao3-shadow-md)` |
| `07-interactions.css:317` | `3px 3px 5px` | `var(--ao3-shadow-lg)` |
| `07-interactions.css:465` | `0 0 8px 0 rgba(0, 0, 0, 0.2)` | `var(--ao3-shadow-popover)` |
| `07-interactions.css:532` | `0 0 8px 0 rgba(0, 0, 0, 0.2)` | `var(--ao3-shadow-popover)` |
| `07-interactions.css:550` | `0 0 5px 0 rgba(0, 0, 0, 0.2)` | `var(--ao3-shadow-md)` |
| `07-interactions.css:583` | `1px 2px 3px #999` | `var(--ao3-shadow-sm)` |
| `07-interactions.css:664` | `1px 2px 5px` | `var(--ao3-shadow-md)` |
| `08-actions.css:124` | `-1px -1px 2px rgba(0,0,0,0.75)` | `var(--ao3-shadow-sm)` |
| `08-actions.css:156` | `2px 2px 5px #bbb` | `var(--ao3-shadow-md)` |
| `08-actions.css:239` | `2px 2px 5px #bbb` | `var(--ao3-shadow-md)` |
| `10-types-groups.css:100` | `1px 1px 5px #aaa` | `var(--ao3-shadow-md)` |
| `22-system-messages.css:52` | `1px 1px 2px` | `var(--ao3-shadow-sm)` |
| `22-system-messages.css:61` | `0px 0 3px #fff` | `var(--ao3-shadow-sm)` |

- [ ] **Apply edits, verify, commit**

```bash
grep -c "var(--ao3-shadow-" public/stylesheets/site/2.0/07-interactions.css
# Expected: 8 (or more after Tasks 5/6)
git commit -m "feat(skin): replace ad-hoc drop shadows with elevation tokens (light)"
```

---

## Task 5: Strip inset skeuomorphic shadows + add focus rings (Phase 3c — light)

**Files:** 4 CSS files.

- [ ] **Step 1: `07-interactions.css:35`** — change `box-shadow: inset 1px 0 5px #999;` to `box-shadow: var(--ao3-shadow-xs);`
- [ ] **Step 2: `07-interactions.css:77`** — change `box-shadow: inset 0 1px 2px #ccc;` to `box-shadow: none;`
- [ ] **Step 3: Append focus ring rule to `07-interactions.css`:**

```css
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--ao3-ring);
  box-shadow: 0 0 0 3px rgba(166, 166, 169, 0.5);
}
```

- [ ] **Step 4: `08-actions.css:94`** — change `box-shadow: inset 2px 2px 2px #bbb;` to `box-shadow: var(--ao3-shadow-xs);`
- [ ] **Step 5: `08-actions.css:101`** — change `box-shadow: inset 1px 1px 3px #333;` to `box-shadow: none;`
- [ ] **Step 6: `11-group-listbox.css:40`** — change `box-shadow: inset 1px 1px 3px #bbb;` to `box-shadow: none;`
- [ ] **Step 7: `22-system-messages.css:38`** — change `box-shadow: inset 1px 1px 2px;` to `box-shadow: var(--ao3-shadow-xs);`
- [ ] **Step 8: `25-media-midsize.css:40`** — change `box-shadow: inset 2px 2px 5px #bbb;` to `box-shadow: var(--ao3-shadow-xs);`
- [ ] **Step 9: `03-region-header.css:222`** — change the multi-layer bevel to `box-shadow: var(--ao3-shadow-sm);`
- [ ] **Step 10: Verify and commit**

```bash
grep -c "inset [0-9]" public/stylesheets/site/2.0/0[78]-*.css
# Should be greatly reduced (some `inset` may remain in non-button contexts)
git commit -m "feat(skin): strip inset skeuomorphic shadows, add comcom focus rings"
```

---

## Task 6: Apply card elevation — replace borders with shadow-card ring (Phase 3b — light)

**Files:** 6 CSS files. The `--ao3-shadow-card` first layer (`0 0 0 1px rgba(0,0,0,0.07)`) replaces the visible border.

For each: change `border: Npx solid #ccc/#ddd/#bbb;` to `border: 0;` and add `box-shadow: var(--ao3-shadow-card);`

| File:Line | Selector |
|---|---|
| `01-core.css:35-39` | `li.blurb, fieldset, form dl` |
| `11-group-listbox.css:8` | `.listbox, fieldset fieldset.listbox` |
| `12-group-meta.css:6` | `dl.meta` |
| `13-group-blurb.css:340` | `.bookmark .user` |
| `15-group-comments.css:17` | `div.comment, li.comment` |
| `08-actions.css:151` | `.secondary` (replaces the `--ao3-shadow-md` added in Task 4) |

- [ ] **Apply edits, verify, commit**

```bash
grep -c "var(--ao3-shadow-card)" public/stylesheets/site/2.0/*.css
# Expected: 6
git commit -m "feat(skin): replace card borders with --ao3-shadow-card ring elevation"
```

---

## Task 7: Flatten gradient buttons (Phase 4a-c)

**Files:** 3 CSS files.

- [ ] **Step 1: `08-actions.css:25-46` main button block**

Delete the 5 `background-image:` lines. The block becomes:
```css
.actions a, .actions a:link, .action, .action:link, .actions button, .actions input, input[type="submit"], button, .current, .actions label {
  background: var(--ao3-muted);
  color: var(--ao3-fg);
  text-decoration: none;
  border: 1px solid var(--ao3-border);
  border-radius: var(--ao3-radius-sm);
  padding: 0.25em 0.75em;
  cursor: pointer;
  transition: background var(--ao3-duration) var(--ao3-ease), border-color var(--ao3-duration) var(--ao3-ease);
  box-shadow: none;
}
```
(Preserve any existing properties not listed — e.g., `vertical-align`, `line-height`.)

- [ ] **Step 2: `08-actions.css:90-92` hover/focus**

Replace the `border-top: 1px solid #999; border-left: 1px solid #999; box-shadow: ...` trio with:
```css
.actions a:hover, ..., .action:hover, .action:focus {
  background: var(--ao3-border);
  color: var(--ao3-fg);
  border-color: var(--ao3-border-strong);
  box-shadow: none;
}
.actions a:focus-visible, .actions button:focus-visible, .actions input:focus-visible, .action:focus-visible {
  outline: none;
  border-color: var(--ao3-ring);
  box-shadow: 0 0 0 3px rgba(166, 166, 169, 0.5);
}
.actions a:active, .actions button:active, .actions input:active, .action:active {
  transform: translateY(1px);
}
```

- [ ] **Step 3: `03-region-header.css:77-81`** — delete 4 gradient lines + IE filter line; replace with `background: var(--ao3-card);` (keep `box-shadow: var(--ao3-shadow-sm);` from Task 4)
- [ ] **Step 4: `18-zone-searchbrowse.css:199-201`** — replace 3 gradient lines with `background: var(--ao3-muted);`
- [ ] **Step 5: `18-zone-searchbrowse.css:225-227`** — replace with `background: #d1f0d1;` (preserve semantic green)
- [ ] **Step 6: `18-zone-searchbrowse.css:255-257`** — replace with `background: #efd1d1;` (preserve semantic red)
- [ ] **Step 7: `22-system-messages.css:221`** — replace gradient with `background: var(--ao3-muted);`
- [ ] **Step 8: Verify and commit**

```bash
grep -c "linear-gradient" public/stylesheets/site/2.0/08-actions.css
# Expected: 0
git commit -m "feat(skin): flatten gradient buttons to muted surfaces with transitions"
```

---

## Task 8: Define button variant classes (Phase 4d)

**Files:** Append to `public/stylesheets/site/2.0/08-actions.css`.

- [ ] **Step 1: Append variant CSS**

```css
/* === Button variants (opt-in via ERB class) === */

.action.primary, .actions .primary {
  background: var(--ao3-primary);
  color: var(--ao3-primary-fg);
  border-color: var(--ao3-primary);
}
.action.primary:hover, .actions .primary:hover,
.action.primary:focus, .actions .primary:focus {
  background: #3a3a3e;
  color: var(--ao3-primary-fg);
  border-color: #3a3a3e;
}
.action.primary:focus-visible {
  border-color: var(--ao3-ring);
  box-shadow: 0 0 0 3px rgba(166, 166, 169, 0.5);
}

.action.destructive, .actions .destructive {
  background: rgba(229, 72, 77, 0.10);
  color: var(--ao3-destructive);
  border-color: transparent;
}
.action.destructive:hover, .actions .destructive:hover,
.action.destructive:focus, .actions .destructive:focus {
  background: rgba(229, 72, 77, 0.18);
  color: var(--ao3-destructive);
}
.action.destructive:focus-visible {
  border-color: var(--ao3-destructive);
  box-shadow: 0 0 0 3px rgba(229, 72, 77, 0.20);
}

/* END == */
```

- [ ] **Step 2: Verify and commit**

```bash
curl -s http://localhost:3000/stylesheets/site/2.0/08-actions.css | grep -c -E "\.action\.(primary|destructive)"
# Expected: at least 4
git commit -m "feat(skin): add .action.primary and .action.destructive variant classes"
```

---

## Task 9: Wire destructive class into ERB (Phase 4e — 49 sites)

**Pattern:** insert `class: "action destructive",` after the path argument in `link_to`/`button_to`, or add `, class: "action destructive"` to `submit_tag`. **Skip** the 2 dead-code sites in `external_authors/` (commented out).

### Task 9a: Works + Chapters + Series (8 sites)

| File:Line | Action |
|---|---|
| `app/views/works/_work_blurb.html.erb:17` | add class to `link_to ts("Delete Draft"), ...` |
| `app/views/works/_standard_form.html.erb:150` | add class to `link_to t(".remove"), ...` |
| `app/views/works/_standard_form.html.erb:192` | add class to `link_to ts("Remove Work From Series"), ...` |
| `app/views/works/confirm_delete_multiple.html.erb:19` | add class to `submit_tag ts("Yes, Delete Works")` |
| `app/views/chapters/edit.html.erb:12` | add class to `link_to ts("Delete Chapter"), ...` |
| `app/views/chapters/edit.html.erb:17` | add class to "Remove Me As Chapter Co-Creator" `button_to` |
| `app/views/chapters/manage.html.erb:33` | add class to `link_to ts("Delete"), ...` |
| `app/views/chapters/manage.html.erb:39` | add class to "Remove Me As Chapter Co-Creator" `button_to` |
| `app/views/series/_series_navigation.html.erb:4` | add class to `link_to ts("Delete Series"), ...` |
| `app/views/series/_series_navigation.html.erb:8` | add class to "Remove Me As Co-Creator" `button_to` |

- [ ] Apply, verify (`grep -rn 'class: "action destructive"' app/views/{works,chapters,series}/ | wc -l` ≥ 8), commit `feat(views): wire .action.destructive on works/chapters/series`

### Task 9b: Bookmarks/Readings + Collections (6 sites)

| File:Line | Action |
|---|---|
| `app/views/readings/_reading_blurb.html.erb:55` | add class to submit_tag |
| `app/views/collections/_collection_form_delete.html.erb:3` | add class |
| `app/views/collections/_header.html.erb:27` | add class to "Leave" link |
| `app/views/collection_profile/show.html.erb:113` | add class |
| `app/views/collection_participants/_participant_form.html.erb:12` | add class to "Remove" button_to |

- [ ] Apply, verify, commit `feat(views): wire .action.destructive on collections/readings`

### Task 9c: Challenges/Prompts/Signups/Claims (10 sites)

| File:Line | Action |
|---|---|
| `app/views/challenge/shared/_challenge_form_delete.html.erb:1` | add class |
| `app/views/prompts/_prompt_controls.html.erb:22,30,46` | add class to all 3 |
| `app/views/prompts/_prompt_navigation.html.erb:5` | add class |
| `app/views/challenge_signups/_signup_controls.html.erb:36,40` | add class to both |
| `app/views/challenge_claims/_unposted_claim_blurb.html.erb:56` | add class |
| `app/views/potential_matches/_no_potential_recipients.html.erb:16` | add class |
| `app/views/potential_matches/_no_potential_givers.html.erb:18` | add class |

- [ ] Apply, verify, commit `feat(views): wire .action.destructive on challenges/prompts/signups`

### Task 9d: Comments + Tags + Tag Sets (6 sites)

| File:Line | Action |
|---|---|
| `app/views/comments/_confirm_delete.html.erb:4` | add class to button_to |
| `app/views/owned_tag_sets/_navigation.html.erb:18` | add class |
| `app/views/tag_set_nominations/show.html.erb:15` | add class |
| `app/views/tag_set_nominations/confirm_destroy_multiple.html.erb:5` | form is `class: "simple destroy"`; find the submit_tag inside and add `class: "action destructive"` |
| `app/views/tag_wranglers/index.html.erb:41` | add `:class => "action destructive"` (legacy hash-rocket syntax) |

- [ ] Apply, verify, commit `feat(views): wire .action.destructive on comments/tags`

### Task 9e: Users/Pseuds/Profile/Sessions (10 sites)

| File:Line | Action |
|---|---|
| `app/views/users/delete_preview.html.erb` (find submit) | add class |
| `app/views/users/sessions/_greeting.html.erb:48,54` | add class to both log_out links |
| `app/views/users/sessions/confirm_logout.html.erb` | add class to submit_tag (form is `class: "simple destroy"`) |
| `app/views/profile/show.html.erb:36` | add class |
| `app/views/pseuds/_pseud_blurb.html.erb:32` | add class |
| `app/views/pseuds/delete_preview.html.erb:23` | add class to `submit_tag ts("Submit")` |
| `app/views/home/site_map.html.erb:56` | add class |
| `app/views/blocked/users/confirm_unblock.html.erb:19` | add class to submit |
| `app/views/muted/users/confirm_unmute.html.erb:17` | add class to submit |
| `app/views/subscriptions/index.html.erb:76` | add `class: "action destructive"` to `f.submit` |

- [ ] Apply, verify, commit `feat(views): wire .action.destructive on users/sessions/profile`

### Task 9f: Inbox/Invitations/Invite Requests (6 sites)

| File:Line | Action |
|---|---|
| `app/views/inbox/_delete_form.html.erb:5` | add class |
| `app/views/inbox/show.html.erb:28,93` | add class to both (keep `name:` arg) |
| `app/views/invitations/_user_invitations.html.erb:34` | add class |
| `app/views/invite_requests/manage.html.erb:51` | add class to submit_tag |

- [ ] Apply, verify, commit `feat(views): wire .action.destructive on inbox/invitations`

### Task 9g: Skins + Admin Posts + Admin (8 sites)

| File:Line | Action |
|---|---|
| `app/views/skins/_skin_actions.html.erb:18` | add class |
| `app/views/skins/confirm_delete.html.erb` (find submit) | add class |
| `app/views/admin/_admin_nav.html.erb:22` | add class |
| `app/views/admin/_admin_options.html.erb:64` | add class |
| `app/views/admin/sessions/confirm_logout.html.erb` | add class to submit |
| `app/views/admin/blacklisted_emails/index.html.erb:50` | add class |
| `app/views/admin/banners/confirm_delete.html.erb` | add class to submit |
| `app/views/admin/support_notices/confirm_delete.html.erb` | add class to submit |
| `app/views/admin_posts/_admin_post_blurb.html.erb:16,21` | add class to both |
| `app/views/admin_posts/show.html.erb:23` | add class |

- [ ] Apply, verify, commit `feat(views): wire .action.destructive on skins/admin`

### Task 9h: Wrangling Guidelines + Known Issues (2 sites)

| File:Line | Action |
|---|---|
| `app/views/wrangling_guidelines/_admin_index.html.erb:24` | add `:class => "action destructive"` (hash-rocket) |
| `app/views/known_issues/_admin_index.html.erb:19` | add `:class => "action destructive"` |

- [ ] Apply, verify, commit `feat(views): wire .action.destructive on guidelines/issues`

### Task 9 final check

```bash
grep -rn 'class: "action destructive"\|:class => "action destructive"' app/views/ | wc -l
# Expected: ~47 (49 minus 2 dead-code external_authors sites)
```

---

## Task 10: Wire primary class into ERB (Phase 4e — 24 sites)

**Pattern:** `submit_tag "Post"` → `submit_tag "Post", class: "action primary"`. Special: `user_invite_requests/index.html.erb:36` has TWO submit_tags — first (`ts("Update")`) gets `class: "action primary"`, second (`ts("Decline All")`) gets `class: "action destructive"`.

| File:Line | Submit value | Class |
|---|---|---|
| `app/views/chapters/_chapter_management.html.erb:6` | `ts("Post Chapter")` | primary |
| `app/views/chapters/manage.html.erb:53` | `ts("Update Positions")` | primary |
| `app/views/challenge_signups/_signup_form.html.erb:17` | `ts('Update Form')` | primary |
| `app/views/works/edit_multiple.html.erb:114` | `ts("Update All Works")` | primary |
| `app/views/user_invite_requests/index.html.erb:36` (first) | `ts("Update")` | primary |
| `app/views/user_invite_requests/index.html.erb:36` (second) | `ts("Decline All")` | destructive |
| `app/views/unsorted_tags/index.html.erb:11,40` | `ts("Update")` x2 | primary |
| `app/views/series/_series_order.html.erb:14` | `"Update Positions"` | primary |
| `app/views/tag_set_nominations/_review.html.erb:63` | `ts("Submit")` | primary |
| `app/views/potential_matches/_match_navigation.html.erb:15` | `ts("Save Assignment Changes")` | primary |
| `app/views/questions/manage.html.erb:18` | `ts("Update Positions")` | primary |
| `app/views/known_issues/_known_issues_form.html.erb:33` | `ts("Post")` | primary |
| `app/views/archive_faqs/_archive_faq_form.html.erb:14` | `ts("Update Form")` | primary |
| `app/views/archive_faqs/_archive_faq_form.html.erb:58` | `ts("Post")` | primary |
| `app/views/archive_faqs/_archive_faq_order.html.erb:12` | `"Update Positions"` | primary |
| `app/views/archive_faqs/_archive_faq_questions_order.html.erb:12` | `"Update Positions"` | primary |
| `app/views/wrangling_guidelines/_wrangling_guideline_order.html.erb:12` | `ts('Update Positions')` | primary |
| `app/views/invitations/index.html.erb:5` | `'Create'` | primary |
| `app/views/collection_participants/_add_participants_form.html.erb:7` | `ts("Submit")` | primary |
| `app/views/admin/admin_users/_user_form.html.erb:23` | `ts("Update")` | primary |
| `app/views/admin/skins/index.html.erb:63` | `ts('Update')` | primary |
| `app/views/admin/skins/index_approved.html.erb:84` | `ts("Update")` | primary |
| `app/views/admin/skins/index_rejected.html.erb:43` | `ts('Update')` | primary |

- [ ] **Apply all 24 edits per the table**
- [ ] **Verify**

```bash
grep -rn 'class: "action primary"' app/views/ | wc -l
# Expected: 23
grep -c 'class: "action destructive"' app/views/user_invite_requests/index.html.erb
# Expected: 1
```

- [ ] **Commit**

```bash
git add app/views/
git commit -m "feat(views): wire .action.primary on submit buttons (Post/Update/Save/Create)"
```

---

## Task 11: Modernize link styles (Phase 5)

**Files:**
- Modify: `public/stylesheets/site/2.0/02-elements.css:28-54`
- Modify: `public/stylesheets/site/2.0/21-userstuff.css` (append override)

- [ ] **Step 1: Rewrite `02-elements.css:28-46`**

Replace the existing `a, a:link, a:visited:hover { ... }` through `a:active, a:focus, button:focus { outline: 1px dotted; }` block with:

```css
a, a:link {
  color: #900;
  text-decoration: none;
  border-bottom: 0;
  transition: color var(--ao3-duration) var(--ao3-ease);
}

a:hover {
  color: #b30000;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}

a:visited {
  color: #7a0040;
}

a:active {
  color: #900;
}

a:focus-visible, button:focus-visible {
  outline: 2px solid var(--ao3-ring);
  outline-offset: 2px;
  border-radius: var(--ao3-radius-sm);
}
```

Keep `a img { border: 0; }` and update `a:focus img { outline: ... }` to use the new ring.

- [ ] **Step 2: Append `.userstuff a` override to `21-userstuff.css`**

```css
/* Preserve AO3's classic link treatment inside authored work content. */
.userstuff a, .userstuff a:link {
  color: #111;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}
.userstuff a:visited {
  color: #666;
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
}
.userstuff a:hover {
  color: #999;
  text-decoration: none;
}
.userstuff a:focus-visible {
  outline: 2px solid var(--ao3-ring);
  outline-offset: 2px;
}
```

- [ ] **Step 3: Verify and commit**

```bash
curl -s http://localhost:3000/stylesheets/site/2.0/02-elements.css | grep -c "var(--ao3-ring)\|text-underline-offset"
# Expected: at least 2
git commit -m "feat(skin): modernize chrome links, preserve .userstuff link styling"
```

---

## Task 12: Dark mode shadow modernization (Phase 3d)

**Files:**
- Modify: `public/stylesheets/masters/dark_mode/dark_mode_site_screen_.css`
- Modify: `public/stylesheets/masters/dark_mode/dark_mode_midsize_.css`

- [ ] **Step 1: Add `:root` shadow-token overrides at the top of `dark_mode_site_screen_.css`**

Insert immediately after the file header comment:

```css
/* === Dark-mode shadow token overrides (comcom elevation w/ inset bevel) === */
:root {
  --ao3-shadow-xs: inset 0 1px 0 0 rgb(255 255 255 / 0.04), 0 1px 1px -0.5px rgb(0 0 0 / 0.18);
  --ao3-shadow-sm: inset 0 1px 0 0 rgb(255 255 255 / 0.05), 0 1px 1px -0.5px rgb(0 0 0 / 0.18), 0 2px 2px -1px rgb(0 0 0 / 0.18);
  --ao3-shadow-md: inset 0 1px 0 0 rgb(255 255 255 / 0.06), 0 1px 1px -0.5px rgb(0 0 0 / 0.18), 0 2px 2px -1px rgb(0 0 0 / 0.18), 0 4px 4px -2px rgb(0 0 0 / 0.18);
  --ao3-shadow-lg: inset 0 1px 0 0 rgb(255 255 255 / 0.07), inset 0 0 0 1px rgb(255 255 255 / 0.03), 0 1px 1px -0.5px rgb(0 0 0 / 0.18), 0 3px 3px -1.5px rgb(0 0 0 / 0.18), 0 6px 6px -3px rgb(0 0 0 / 0.18);
  --ao3-shadow-card: inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.04), 0 1px 1px -0.5px rgb(0 0 0 / 0.18), 0 3px 3px -1.5px rgb(0 0 0 / 0.18), 0 6px 6px -3px rgb(0 0 0 / 0.18), 0 12px 12px -6px rgb(0 0 0 / 0.22), 0 24px 24px -12px rgb(0 0 0 / 0.22);
  --ao3-shadow-popover: inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.04), 0 4px 6px -1px rgb(0 0 0 / 0.22), 0 10px 15px -3px rgb(0 0 0 / 0.22);
}
```

- [ ] **Step 2: Neutralize redundant per-selector shadow overrides**

In `dark_mode_site_screen_.css`, for each line below, delete the `box-shadow:` declaration (keep other declarations in the same rule intact):

Lines: `:87, :109, :155, :167, :204, :249, :255, :259, :266, :308, :340, :362, :377, :405, :414, :481, :515, :528, :746, :753, :763, :768, :786`

- [ ] **Step 3: Modernize dark-ONLY shadows (rewrite value)**

| Line | Selector | New value |
|---|---|---|
| `:24` | `table` | `var(--ao3-shadow-sm)` |
| `:119` | `#dashboard .current` | `var(--ao3-shadow-sm)` |
| `:385` | `.current, a.current, a:link.current` | `var(--ao3-shadow-sm)` |
| `:443` | `span.unread, .replied, ...` | `var(--ao3-shadow-xs)` |
| `:545` | `li.blurb, .listbox li.blurb` | `var(--ao3-shadow-card)` |
| `:550` | `.blurb .blurb` | `var(--ao3-shadow-sm)` |
| `:578` | `div.comment, li.comment` | `var(--ao3-shadow-card)` |
| `:622` | `.splash .module div.account` | `var(--ao3-shadow-card)` |
| `:687` | `form.filters fieldset` | `var(--ao3-shadow-card)` |

Leave as `none`: `:318` (`.mce-container button`), `:692` (`.filters .expander`)

- [ ] **Step 4: `dark_mode_midsize_.css:13`** — change `1px 1px 3px #000` to `var(--ao3-shadow-sm)`

- [ ] **Step 5: Verify and commit**

```bash
grep -c "var(--ao3-shadow" public/stylesheets/masters/dark_mode/dark_mode_site_screen_.css
# Expected: ≥ 15
grep -c "inset 0 -8px 4px\|inset 0 8px 7px" public/stylesheets/masters/dark_mode/dark_mode_site_screen_.css
# Expected: 0
git commit -m "feat(skin): modernize dark-mode shadows via token override + bevel removal"
```

---

## Task 13: Final verification sweep

- [ ] **Step 1: Token resolution check**

```bash
curl -s http://localhost:3000/stylesheets/site/2.0/00-tokens.css | grep -c "^\s*--ao3-"
# Expected: ~25
curl -s http://localhost:3000/ -o /tmp/ao3_home.html
grep -c "00-tokens.css\|00-fonts.css" /tmp/ao3_home.html
# Expected: 2
```

- [ ] **Step 2: No stale gradients or skeuomorphic insets**

```bash
grep -c "linear-gradient" public/stylesheets/site/2.0/08-actions.css public/stylesheets/site/2.0/18-zone-searchbrowse.css public/stylesheets/site/2.0/22-system-messages.css
# Expected: 0 (or very low — 18-zone-searchbrowse keeps semantic green/red as flat colors, not gradients)
```

- [ ] **Step 3: ERB wiring count**

```bash
grep -rn 'class: "action destructive"\|:class => "action destructive"' app/views/ | wc -l
# Expected: ~47
grep -rn 'class: "action primary"' app/views/ | wc -l
# Expected: ~23
```

- [ ] **Step 4: Visual sweep**

Visit:
- `/` — home: warm bg, `.splash h1` Redaction 70, `.splash .module div.account` rounded shadow-card
- `/works/search?utf8=✓` — `.blurb` cards float with layered shadow + ring
- `/works/new` — "Post" button is high-contrast `.action.primary`; hover darkens; click translateY
- A work page — `.userstuff` body unchanged (Lucida, classic dashed links)
- A confirm-delete page — destructive button shows tinted red
- Tab through nav — focus rings visible
- Toggle dark mode (if seeded) — cards have inset bevel + dark elevation

- [ ] **Step 5: Final commit if cleanup needed**

```bash
git status
git add -p
git commit -m "chore(skin): final cleanup from surface modernization pass"
```

---

## Self-Review

1. **Spec coverage** — every phase (0-5) maps to ≥1 task. ✓
2. **Placeholder scan** — no "TBD" or "implement later"; all values concrete. ✓
3. **Token name consistency** — all prefixed `--ao3-`; `--ao3-shadow-card` used uniformly. ✓
4. **Class name consistency** — `action.primary` / `action.destructive` uniform across CSS and ERB. ✓
5. **Browser support floor** — CSS vars, `:focus-visible`, `rgb(... / ...)` all supported Chrome 49+/FF 31+/Safari 9.1+. IE degrades gracefully. ✓
6. **`.userstuff` boundary** — both typography and links preserve work-content isolation. ✓
7. **Dark parity** — Task 12 covers dark_mode master. Palette changes overridden by dark_mode's own bg/fg. ✓
8. **Rollback path** — `git revert` + re-run Task 1 runner (idempotent). ✓

---

## Execution Notes

- **Dark mode is not seeded in the dev DB.** Task 12 verification is offline (visual diff of CSS). Seed via admin UI per `public/stylesheets/masters/dark_mode/README.md` if live verification is needed.
- **The `icon.attach` validation bug** in `Skin.load_site_css` (skin.rb:496) is worked around in Task 1 by skipping `icon.attach` and using `save(validate: false)`.
- **Commit cadence** — one commit per task (or per ERB controller group in Task 9).
- **Skin cache** — every `Skin.save` bumps `skin_cache_version`; `skin_tag`'s `Rails.cache.fetch` invalidates automatically. No server restart needed between tasks.
