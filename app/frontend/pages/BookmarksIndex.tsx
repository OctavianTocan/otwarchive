import { router } from "@inertiajs/react";
import AppShell from "../components/AppShell";
import { useState } from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type TagRef = { name: string; url: string | null; type: string };
type WorkBlurb = {
  id: number; title: string; url: string;
  authors: { name: string; url: string | null }[]; anonymous: boolean;
  fandoms: TagRef[]; ratings: TagRef[]; warnings: TagRef[]; categories: TagRef[];
  relationships: TagRef[]; characters: TagRef[]; freeforms: TagRef[];
  summaryHtml: string | null;
  stats: { language?: string; words?: number; chapters?: string; comments?: number; kudos?: number; bookmarks?: number; hits?: number };
  published?: string; updated?: string; complete?: boolean;
};
type Bookmarkable = { type: string; title: string | null; url: string | null; blurb: WorkBlurb | null };
type Bookmark = {
  id: number;
  bookmarkable: Bookmarkable;
  bookmarker: { name: string | null; url: string | null };
  notesHtml: string | null;
  tags: TagRef[];
  rec: boolean;
  private: boolean;
  created: string | null;
};
type FacetGroup = { key: string; label: string; items: { value: string; label: string; count: number; active: boolean }[] };
type Filters = { include: Record<string, string[]>; bookmark_search: Record<string, string>; page: number };
type Props = {
  context: { heading: string; ownerName: string | null };
  bookmarks: Bookmark[];
  pagination: { page: number; pages: number; count: number };
  facets: FacetGroup[];
  filters: Filters;
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");
const SORTS: [string, string][] = [
  ["created_at", "Date Bookmarked"], ["bookmarkable_date", "Date Updated"],
  ["title", "Title"], ["word_count", "Word Count"],
];

function buildUrl(inc: Record<string, string[]>, bs: Record<string, string>, page: number) {
  const p = new URLSearchParams();
  for (const [key, ids] of Object.entries(inc)) for (const id of ids) p.append(`include_bookmark_search[${key}_ids][]`, id);
  for (const [k, v] of Object.entries(bs)) if (v) p.append(`bookmark_search[${k}]`, v);
  if (page > 1) p.set("page", String(page));
  return `${window.location.pathname}?${p.toString()}`;
}

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "outline"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function WorkStats({ w }: { w: WorkBlurb }) {
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
      {w.stats.language && <span><dt className="inline font-semibold">Language:</dt> <dd className="inline">{w.stats.language}</dd></span>}
      <span><dt className="inline font-semibold">Words:</dt> <dd className="inline">{n(w.stats.words)}</dd></span>
      <span><dt className="inline font-semibold">Chapters:</dt> <dd className="inline">{w.stats.chapters}</dd></span>
      <span><dt className="inline font-semibold">Kudos:</dt> <dd className="inline">{n(w.stats.kudos)}</dd></span>
      <span><dt className="inline font-semibold">Hits:</dt> <dd className="inline">{n(w.stats.hits)}</dd></span>
    </dl>
  );
}

function WorkHeader({ w }: { w: WorkBlurb }) {
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words min-w-0 break-words font-semibold text-base leading-snug">
          <a href={w.url} className="text-link hover:underline">{w.title}</a>
          <span className="font-normal text-muted-foreground"> by </span>
          {w.authors.map((a, i) => (
            <span key={i}>{i > 0 && ", "}<a href={a.url ?? "#"} className="text-link hover:underline">{a.name}</a></span>
          ))}
        </h4>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {w.ratings[0] && <Badge variant="outline">{w.ratings[0].name}</Badge>}
          <Badge variant={w.warnings.some((x) => x.name !== "No Archive Warnings Apply") ? "destructive" : "outline"}>
            {w.warnings.some((x) => x.name !== "No Archive Warnings Apply") ? "⚠" : "✓"}
          </Badge>
          <Badge variant="outline">{w.complete ? "Complete" : "WIP"}</Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">{w.fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}</div>
      <div className="flex flex-wrap gap-1">
        {w.warnings.filter((x) => x.name !== "No Archive Warnings Apply").map((t, i) => <TagBadge key={`w${i}`} t={t} variant="destructive" />)}
        {[...w.relationships, ...w.characters, ...w.freeforms].map((t, i) => <TagBadge key={`t${i}`} t={t} variant="outline" />)}
      </div>
      {w.summaryHtml && <div className="text-foreground/90 [&_p]:my-1" dangerouslySetInnerHTML={{ __html: w.summaryHtml }} />}
      <WorkStats w={w} />
    </>
  );
}

function BookmarkCard({ b }: { b: Bookmark }) {
  const bm = b.bookmarkable;
  const blurb = bm.blurb;
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      {blurb ? (
        <WorkHeader w={blurb} />
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h4 className="min-w-0 break-words min-w-0 break-words font-semibold text-base leading-snug">
            {bm.url ? <a href={bm.url} className="text-link hover:underline">{bm.title ?? "(untitled)"}</a> : (bm.title ?? "(deleted)")}
          </h4>
          <Badge variant="outline" className="shrink-0">{bm.type}</Badge>
        </div>
      )}

      <div className="border-border border-t border-dashed pt-3">
        <p className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
          <span>
            Bookmarked by{" "}
            {b.bookmarker.url
              ? <a href={b.bookmarker.url} className="font-medium text-link hover:underline">{b.bookmarker.name}</a>
              : <span className="font-medium">{b.bookmarker.name ?? "unknown"}</span>}
          </span>
          {b.rec && <Badge variant="default">Rec</Badge>}
          {b.private && <Badge variant="secondary">Private</Badge>}
          {b.created && <span className="ml-auto tabular-nums text-xs">{b.created}</span>}
        </p>

        {b.tags.length > 0 && (
          <div className="mt-2">
            <span className="mr-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Bookmarker's Tags</span>
            <span className="inline-flex flex-wrap gap-1 align-middle">{b.tags.map((t, i) => <TagBadge key={i} t={t} variant="outline" />)}</span>
          </div>
        )}

        {b.notesHtml && (
          <blockquote className="mt-2 border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1" dangerouslySetInnerHTML={{ __html: b.notesHtml }} />
        )}
      </div>
    </Card>
  );
}

function FacetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-border border-t py-2.5">
      <h3 className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">{title}</h3>
      {children}
    </section>
  );
}

export default function BookmarksIndex({ context, bookmarks, pagination, facets, filters }: Props) {
  const [inc, setInc] = useState<Record<string, string[]>>(filters.include ?? {});
  const [bs, setBs] = useState<Record<string, string>>(filters.bookmark_search ?? {});
  const [busy, setBusy] = useState(false);

  const go = (page = 1, nextInc = inc, nextBs = bs) => {
    setBusy(true);
    router.get(buildUrl(nextInc, nextBs, page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };
  const toggle = (key: string, id: string) => {
    const cur = inc[key] ?? [];
    setInc({ ...inc, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };
  const setScalar = (k: string, v: string) => setBs((s) => ({ ...s, [k]: v }));
  const clear = () => { setInc({}); setBs({}); go(1, {}, {}); };

  const inputCls = "w-full rounded-md border border-border bg-input px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/40";

  return (
    <AppShell>

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-4 pt-6 pb-16 md:grid-cols-[290px_1fr] md:gap-7 md:px-5">
        <aside className="self-start md:sticky md:top-4">
          <Card className="max-h-[calc(100svh-2rem)] gap-0 overflow-auto px-4">
            <div className="flex items-center gap-2 pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Sort & Filter {busy && <span className="text-link">…</span>}
            </div>

            <FacetSection title="Sort by">
              <select value={bs.sort_column ?? "created_at"} onChange={(e) => setScalar("sort_column", e.target.value)} className={inputCls}>
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </FacetSection>

            <FacetSection title="Recs only">
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted">
                <input type="checkbox" checked={(bs.rec ?? "") === "true"} onChange={(e) => setScalar("rec", e.target.checked ? "true" : "")} className="accent-primary" />
                <span className="text-sm">Only show recommendations</span>
              </label>
            </FacetSection>

            <FacetSection title="Search within results">
              <input type="text" placeholder="Keywords" value={bs.bookmarkable_query ?? ""} onChange={(e) => setScalar("bookmarkable_query", e.target.value)} onKeyDown={(e) => e.key === "Enter" && go(1)} className={inputCls} />
            </FacetSection>

            {facets.map((g) => (
              <FacetSection key={g.key} title={g.label}>
                <ul className="grid gap-0.5">
                  {g.items.slice(0, 15).map((it) => (
                    <li key={it.value}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted">
                        <input type="checkbox" checked={(inc[g.key] ?? []).includes(it.value)} onChange={() => toggle(g.key, it.value)} className="accent-primary" />
                        <span className="text-sm">{it.label}</span>
                        <em className="ml-auto text-muted-foreground text-xs not-italic tabular-nums">({n(it.count)})</em>
                      </label>
                    </li>
                  ))}
                </ul>
              </FacetSection>
            ))}

            <div className="sticky bottom-0 mt-3 flex gap-2 bg-card pt-2.5">
              <Button variant="default" size="sm" onClick={() => go(1)} disabled={busy}>Sort and Filter</Button>
              <Button variant="outline" size="sm" onClick={clear} disabled={busy}>Clear</Button>
            </div>
          </Card>
        </aside>

        <main>
          <h2 className="font-bold text-2xl">{context.heading || context.ownerName}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">{n(pagination.count)} bookmarks · page {pagination.page} of {pagination.pages}</p>
          {bookmarks.length === 0 && <p className="py-6 text-muted-foreground">No bookmarks matched these filters.</p>}
          <ol className="grid overflow-hidden rounded-lg border border-border bg-card">{bookmarks.map((b) => <li key={b.id}><BookmarkCard b={b} /></li>)}</ol>
          {pagination.pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1 || busy} onClick={() => go(pagination.page - 1)}>← Prev</Button>
              <span className="tabular-nums">Page {pagination.page} / {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages || busy} onClick={() => go(pagination.page + 1)}>Next →</Button>
            </nav>
          )}
        </main>
      </div>
    </AppShell>
  );
}
