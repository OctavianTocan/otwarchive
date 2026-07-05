# Full-App Conversion Coverage

**Goal:** convert the entire AO3 frontend to React (full parity). Tracks progress across the user-facing surface. Branch `design/comcom-pass-1`.

Legend: ✅ done+verified · 🔄 in progress · ⬜ todo

## Read / list & detail (highest traffic)
- ✅ Works index (`works#index`, all owner variants) · ✅ Work show (`works#show`) · 🔄 Chapter show (`chapters#show`)
- ✅ New/Edit Work (`works#new/edit/create/update`) · 🔄 Works search (`works#search`)
- ✅ Bookmarks index (`bookmarks#index`) · ⬜ Bookmark show/new/edit
- ✅ Collections index + show · ⬜ Collection new/edit, items, participants, profile
- ✅ Series index · 🔄 Series show · ⬜ Series new/edit
- ✅ User profile (`users#show`) · ⬜ Pseud show · ⬜ People/user search
- 🔄 Tag show (`tags#show`) · ⬜ Media/fandoms browse · ⬜ Tag search
- ⬜ Home (`home#index` — landing + dashboard)

## Interaction / write (need CSRF-over-session; pattern proven by work-form)
- ⬜ Kudos · ⬜ Bookmark create/edit · ⬜ Subscribe · ⬜ Comments (display + post) · ⬜ Collection post

## Account / dashboard
- ⬜ Inbox · ⬜ Reading history (`readings`) · ⬜ Subscriptions · ⬜ Preferences · ⬜ Profile edit · ⬜ Gifts

## Challenges (large subsystem)
- ⬜ Challenges, signups, assignments, claims, prompts, potential matches, nominations

## Misc
- ⬜ Skins · ⬜ Related/external works · ⬜ Downloads · ⬜ Stats · ⬜ Invitations
- ⬜ Static: FAQ/help/known issues/wrangling guidelines/troubleshooting

## Admin (low-traffic, batch last)
- ⬜ ~120 admin templates + tag wrangling

## Enhancement tracks (cross-cutting)
- ⬜ Form depth: TinyMCE rich-text + tag autocomplete (endpoints already in props)
- ⬜ i18n: Rails-I18n → props bridge (pages currently ship English)
- ⬜ SSR sidecar deploy (ADR 0001) + retire-ERB cutover per page

**Converted controllers so far:** works, bookmarks, collections, series, users (+ this round: chapters, tags, works#search, series#show).

**Realistic note:** the full surface is ~700 templates / multi-quarter. This branch establishes the pattern + high-traffic coverage; remaining pages are incremental (controller one-liner + PORO presenter + React page + parity fixture), subagent-parallelizable.
