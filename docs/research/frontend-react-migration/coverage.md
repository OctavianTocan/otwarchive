# Full-App Conversion Coverage

**Goal:** convert the entire AO3 frontend to React (full parity). Branch `design/comcom-pass-1`.
Legend: ✅ done+verified · ⬜ todo

> **2026-07-05 update:** Fixed bare-index ERB fall-throughs — `/works`, `/bookmarks`,
> `/works/search` (the sidebar Works/Bookmarks/Search links) now render React (guard
> required `@owner && @search`; presenters already degrade). Converted `/media/:id/fandoms`
> (FandomsIndex), `/tags` cloud (TagsIndex), `/users/:login/pseuds` (PseudsIndex), and the
> moderator tag-set nominations review. Mobile drawer nav buttons made touch-friendly
> (mobile only). See `HANDOFF.md`. Totals now **32 controllers / 44 React pages**.

## Converted — 32 controllers / 44 React pages (React default, `?ui=legacy` ERB baseline, mobile-responsive, parity-verified)

**Works & reading:** ✅ works index · ✅ work show · ✅ chapter show · ✅ new/edit work (CRUD) · ✅ works search · ✅ reading history · ✅ external work show
**Bookmarks/Collections/Series:** ✅ bookmarks index · ✅ collections index · ✅ collection show · ✅ collection items · ✅ series index · ✅ series show
**People/Tags:** ✅ user profile · ✅ pseud show · ✅ people search · ✅ tag show · ✅ media/fandoms browse
**Account/social:** ✅ home (landing + dashboard) · ✅ inbox (read-only) · ✅ gifts · ✅ subscriptions
**Content/other:** ✅ AO3 news (admin_posts) · ✅ invitations · ✅ stats · ✅ tag sets · ✅ related works · ✅ skins · ✅ FAQ (index+show) · ✅ known issues (index+show) · ✅ wrangling guidelines (index+show)

## Interactions (write) — done
✅ Kudos · ✅ Subscribe · ✅ Bookmark form (create) — Inertia POSTs, CSRF over session, verified persisting.

## Experiments
✅ Mobile bottom-sheet fic reader (tap a work → cogram slide-up sheet, scroll-locked).

## Foundation & chrome (done)
✅ Inverted switch + presenter base + shared props · ✅ cogram-style sidebar + sticky mobile + AO3 logo · ✅ AO3 palette (warm-mono + red brand/links) · ✅ SSR ADR 0001 · ✅ CI parity harness (11/11) · ✅ feed/JS format-guard · ✅ modern-red palette · ✅ de-surfaced flat aesthetic · ✅ vaul mobile drawer (from the right) · ✅ collapsible desktop sidebar · ✅ OG-sized logo/type

## Remaining (tracked; each = the same incremental recipe)
- ⬜ **Write actions:** kudos, bookmark create/edit, subscribe/unsubscribe, comment post, work post-to-collection, inbox reply/approve, collection-items moderate — need Inertia form POSTs (pattern proven by work-form).
- ⬜ **Account settings:** preferences, profile edit, .
- ⬜ **Challenges subsystem:** challenges, signups, assignments, claims, prompts, potential_matches, nominations (large).
- ⬜ **Misc:** downloads, invitations, orphans, questions, comments threads (interactive).
- ⬜ **Admin:** ~120 admin templates + tag wrangling (batch last, low-traffic).
- ⬜ **Enhancement tracks:** form depth (TinyMCE + tag autocomplete — endpoints already in props), i18n (Rails→props bridge), SSR sidecar deploy + retire-ERB cutover.

**Scope reality:** the full surface is ~700 templates / multi-quarter. This branch converts the high-and-mid-traffic user-facing core and establishes the pattern + infra; the remainder is incremental (controller one-liner + PORO presenter + React page + parity fixture), and much of it is subagent-parallelizable when the agent pool is healthy.
