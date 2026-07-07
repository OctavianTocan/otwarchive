# AO3 React Migration Design System

## 1. Atmosphere & Identity

The React migration should feel like AO3 made quieter, faster, and more touch-friendly without losing its archive identity. The signature is warm paper-like surfaces with AO3 red reserved for links and identity accents, plus dense fanwork metadata arranged into calm, scannable cards.

## 2. Color

### Palette

| Role | Token | Light | Usage |
|---|---|---:|---|
| Background | `--background` | `#fdfcfb` | App canvas |
| Foreground | `--foreground` | `#232220` | Main text |
| Card | `--card` | `#ffffff` | Cards, forms, article shells |
| Primary | `--primary` | `#2b2a27` | Primary buttons and active states |
| Primary hover | `--primary-hover` | `#3d3b37` | Primary button hover |
| Secondary/muted | `--secondary`, `--muted` | `#f4f3f1` | Secondary badges, muted fills |
| Muted text | `--muted-foreground` | `#7c7a77` | Hints, metadata, captions |
| Border | `--border` | `#e8e6e1` | Default separators |
| Strong border | `--border-strong` | `#d6d3cc` | Inputs and stronger outlines |
| Input | `--input` | `#ffffff` | Form controls |
| Ring | `--ring` | `#adaba8` | Focus rings |
| Destructive | `--destructive` | `#dc4b3e` | Warning/destructive badges |
| Success | `--success` | `#2e7d55` | Success status badges |
| Brand | `--brand` | `#dc2626` | AO3 identity only |
| Link | `--link` | `#c1121f` | Text links |
| Link hover | `--link-hover` | `#e11d48` | Link hover |
| Link visited | `--link-visited` | `#7a0040` | Future visited-link support |
| Footer | `--footer` | `#900` + `red-ao3.png` | Legacy AO3 contentinfo footer |
| Footer text | `--footer-foreground` | `rgba(255,255,255,.72)` | Footer links/body text |
| Sidebar | `--sidebar` | `#f7f5f2` | Desktop/mobile navigation shell |

### Rules

- Use AO3 red for links and brand identity, not decorative fills.
- The global footer is the exception: it deliberately restores legacy AO3's dark maroon textured surface, `#900 url("/images/skins/textures/tiles/red-ao3.png")`.
- Prefer token-backed Tailwind classes (`bg-card`, `text-muted-foreground`, `text-link`) over raw colors.
- Extend this table before adding new semantic colors.

## 3. Typography

### Scale

| Level | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Page title | `text-2xl` / 24px | 700 | tight | Content index/article titles |
| Section heading | `text-lg` / 18px | 700 | snug | Home/profile sections |
| Card title | `text-base` / 16px | 600 | snug | Card headings |
| Blurb title | `text-[15px]` | 600 | snug | Work/bookmark/person rows |
| Body | `text-sm` / 14px | 400 | normal/relaxed | Default prose and forms |
| Metadata | `text-xs` / 12px | 400-600 | normal | Stats, labels, overlines |

### Font Stack

- Sans: `Geist Sans`, `Lucida Grande`, Verdana, Helvetica, system UI fallback.
- Mono: `Geist Mono`, system monospace fallback.
- Display: `Redaction`, Georgia, serif, reserved for future expressive headings.

### Rules

- Use `tabular-nums` for counts, dates, pagination, and stats.
- Use `break-words`/`min-w-0` on fanwork titles and tags; AO3 content can be long.
- Keep metadata visually secondary with `text-muted-foreground`.

## 4. Spacing & Layout

### Base Unit

All spacing follows Tailwind's 4px scale.

| Token | Value | Usage |
|---|---:|---|
| `gap-1` / `gap-1.5` | 4-6px | Badge groups, compact metadata |
| `gap-2` / `gap-2.5` | 8-10px | Nav rows, form rows |
| `gap-3` / `gap-4` | 12-16px | Card internals and responsive row gaps |
| `gap-6` / `gap-7` | 24-28px | Main/filter layout |
| `px-4` / `md:px-5` | 16/20px | Page gutters |
| `px-5`, `py-5` | 20px | List-row card rhythm |
| `pb-16` | 64px | Page bottom breathing room |

### Grid

- Default page width: `max-w-[1180px]`.
- Reading/content width: `max-w-[900px]`, static/legal width: `max-w-[820px]`.
- Filter pages use `md:grid-cols-[290px_1fr]` with sticky filter cards.
- Breakpoints follow Tailwind defaults; mobile is single-column first.

## 5. Components

### AppShell

- **Structure**: desktop sticky left sidebar, mobile sticky top bar, right-side drawer.
- **Footer**: AO3-style global contentinfo footer using `--footer`, `--footer-texture`, and `--footer-foreground`; it is intentionally darker and more textured than the modern React surfaces.
- **Branding**: use an AO3 logo image plus visible `Archive of Our Own` text. No bundled full wordmark exists, so do not hide the name behind image-only branding.
- **Variants**: expanded/collapsed desktop, resizable desktop, mobile drawer.
- **States**: active route uses `bg-accent text-accent-foreground`; hover/active use muted fills.
- **Persistence**: desktop sidebar width and collapsed state live in localStorage under `ao3.react.sidebar.width` and `ao3.react.sidebar.collapsed`; clamp width to 220-480px.
- **Accessibility**: logo links home; drawer/collapse buttons carry `aria-label`; resize handle is a vertical separator with keyboard support.
- **Motion**: drawer handled by `vaul-base`; do not add bottom-sheet handles to right drawers.
- **Cogram influence boundary**: borrow dense operational rhythm, persistent/resizable navigation, precise hover/focus states, and scan-friendly item rows. Do not borrow Cogram's copper/coral palette, AI/inbox identity, or product copy.

### LoadingPanel

- **Source**: `app/frontend/components/shared/LoadingPanel.tsx`.
- **Usage**: Suspense fallback and route/content loading states; surrounding chrome should remain mounted when possible.
- **Visual**: Cogram-inspired centered dot-matrix spinner, rethemed to AO3 link red and warm paper/card surfaces.
- **Accessibility**: spinner uses `role="status"` with a short label; animation holds still under `prefers-reduced-motion`.

### Button

- **Source**: `app/frontend/design-system/components/ui/button.tsx` on Base UI.
- **Variants**: default, outline, secondary, ghost, destructive.
- **Sizes**: xs, sm, default, lg, icon variants.
- **States**: focus-visible ring, disabled opacity, hover fills, active scale where authored in page/prose CSS.

### Badge

- **Source**: `badge.tsx` using CVA.
- **Variants**: default, secondary, destructive, attention, success, outline, ghost, link.
- **Usage**: tags, ratings, completion, statuses. Use `render={<a />}` for linked tags.

### Card

- **Source**: `card.tsx` with header/content/footer slots.
- **Variants**: default and `size="sm"`.
- **Usage**: page panels, list rows, form shells. List rows often flatten edges with `rounded-none border-x-0 border-t-0` inside divided lists.

### StaticPage / `.ao3-prose`

- **Structure**: trusted Rails-rendered HTML inside AppShell.
- **Usage**: legal/static pages and low-risk account/invite forms that should keep Rails form contracts.
- **States**: links, form controls, fieldsets, notices, and scrollable TOS blocks are styled in `globals.css`.

### Shared archive page primitives

- **Source**: `app/frontend/components/shared/`.
- **PageFrame**: wraps migrated pages in `AppShell` and applies the standard wide, narrow, or sidebar page gutters from Section 4.
- **SectionHeader**: page and section headings using the Section 3 type scale; optional action link aligns to the heading baseline.
- **PaginationBar**: centered previous/next controls with `tabular-nums`, disabled states, and outline buttons.
- **FilterSidebar / FilterSection**: sticky desktop filter card with mobile disclosure, uppercase metadata labels, token-backed inputs, and a sticky action footer.
- **TagPill**: linked tag/status pill built on `Badge`; use `secondary` for fandom/favorites and `outline` for descriptive tags.
- **StatRow**: dashed-top metadata `dl`; all numeric values use `tabular-nums`.

### Work-like blurb rows

- **Source**: `WorkBlurbCard` in `app/frontend/components/shared/`.
- **Usage**: `WorksIndex`, `WorksSearch`, `Home`, and future work-like pages.
- **Rules**: title/byline first, badges second, tag rows third, summary/prose fourth, stats in a dashed-top `dl` with `tabular-nums`.
- **Variants**: full stats for index/search pages; compact stats and optional category/language suppression for homepage/history-style previews.
- **Cogram influence**: rows use predictable title/content/action rhythm, subtle inset hover indication, explicit focus rings, compact metadata, and no copied Cogram colors/components.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | 150ms | ease-out | Button/link/card hover, active press |
| Drawer | library default | vaul-base | Mobile navigation drawer |
| Sheet | CSS transition | transform/opacity | Fic-reader bottom sheet |

### Rules

- Animate color, opacity, transform, and shadow only; never layout dimensions.
- Use hover plus active feedback on interactive rows/buttons.
- Respect mobile hit targets: primary nav drawer rows are large; small icon buttons should stay at least 36-40px.

## 7. Depth & Surface

### Strategy

Mixed: warm tonal shifts plus subtle borders and restrained elevation.

| Level | Token/value | Usage |
|---|---|---|
| Subtle | `--elevation-sm` | Form fieldsets, light raised surfaces |
| Card | `--elevation-card` | Future elevated cards; current cards mostly use borders |
| Medium | `--elevation-md` | Popovers/modals if added |
| Separator | `border-border`, dashed top borders | Metadata and AO3-style divisions |

### Rules

- Prefer quiet separators for dense archive lists.
- Use shadows sparingly for form shells and popovers, not every list row.
- Keep nested radii concentric: outer card `rounded-lg/xl`, inner controls `rounded-md/lg`.
