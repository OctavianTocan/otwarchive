import { router } from "@inertiajs/react";
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
type FacetGroup = { key: string; label: string; items: { value: string; label: string; count: number; active: boolean }[] };
type Filters = { include: Record<string, string[]>; work_search: Record<string, string>; page: number };
type Props = {
  context: { heading: string; ownerName: string | null; tagId: string | null };
  works: WorkBlurb[];
  pagination: { page: number; pages: number; count: number };
  facets: FacetGroup[];
  filters: Filters;
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");
const SORTS: [string, string][] = [
  ["_score", "Best Match"], ["authors_to_sort_on", "Author"], ["title_to_sort_on", "Title"],
  ["created_at", "Date Posted"], ["revised_at", "Date Updated"], ["word_count", "Word Count"],
  ["hits", "Hits"], ["kudos_count", "Kudos"], ["comments_count", "Comments"], ["bookmarks_count", "Bookmarks"],
];

function buildUrl(inc: Record<string, string[]>, ws: Record<string, string>, page: number) {
  const p = new URLSearchParams();
  for (const [key, ids] of Object.entries(inc)) for (const id of ids) p.append(`include_work_search[${key}_ids][]`, id);
  for (const [k, v] of Object.entries(ws)) if (v) p.append(`work_search[${k}]`, v);
  if (page > 1) p.set("page", String(page));
  return `${window.location.pathname}?${p.toString()}`;
}

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "secondary"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function Blurb({ w }: { w: WorkBlurb }) {
  return (
    <Card className="px-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <h4 className="font-semibold text-base leading-snug">
          <a href={w.url} className="text-primary hover:underline">{w.title}</a>
          <span className="font-normal text-muted-foreground"> by </span>
          {w.authors.map((a, i) => (
            <span key={i}>{i > 0 && ", "}<a href={a.url ?? "#"} className="text-primary hover:underline">{a.name}</a></span>
          ))}
        </h4>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {w.ratings[0] && <Badge variant="outline">{w.ratings[0].name}</Badge>}
          <Badge variant={w.warnings.some((x) => x.name !== "No Archive Warnings Apply") ? "destructive" : "outline"}>
            {w.warnings.some((x) => x.name !== "No Archive Warnings Apply") ? "⚠" : "✓"}
          </Badge>
          {w.categories[0] && <Badge variant="outline">{w.categories.map((c) => c.name).join(", ")}</Badge>}
          <Badge variant="outline">{w.complete ? "Complete" : "WIP"}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {w.fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}
      </div>

      <div className="flex flex-wrap gap-1">
        {w.warnings.filter((x) => x.name !== "No Archive Warnings Apply").map((t, i) => <TagBadge key={`w${i}`} t={t} variant="destructive" />)}
        {[...w.relationships, ...w.characters, ...w.freeforms].map((t, i) => <TagBadge key={`t${i}`} t={t} variant="outline" />)}
      </div>

      {w.summaryHtml && <div className="text-foreground/90 [&_p]:my-1" dangerouslySetInnerHTML={{ __html: w.summaryHtml }} />}

      <dl className="flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
        {w.stats.language && <span><dt className="inline font-semibold">Language:</dt> <dd className="inline">{w.stats.language}</dd></span>}
        <span><dt className="inline font-semibold">Words:</dt> <dd className="inline">{n(w.stats.words)}</dd></span>
        <span><dt className="inline font-semibold">Chapters:</dt> <dd className="inline">{w.stats.chapters}</dd></span>
        <span><dt className="inline font-semibold">Comments:</dt> <dd className="inline">{n(w.stats.comments)}</dd></span>
        <span><dt className="inline font-semibold">Kudos:</dt> <dd className="inline">{n(w.stats.kudos)}</dd></span>
        <span><dt className="inline font-semibold">Bookmarks:</dt> <dd className="inline">{n(w.stats.bookmarks)}</dd></span>
        <span><dt className="inline font-semibold">Hits:</dt> <dd className="inline">{n(w.stats.hits)}</dd></span>
      </dl>
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

export default function WorksIndex({ context, works, pagination, facets, filters }: Props) {
  const [inc, setInc] = useState<Record<string, string[]>>(filters.include ?? {});
  const [ws, setWs] = useState<Record<string, string>>(filters.work_search ?? {});
  const [busy, setBusy] = useState(false);

  const go = (page = 1, nextInc = inc, nextWs = ws) => {
    setBusy(true);
    router.get(buildUrl(nextInc, nextWs, page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };
  const toggle = (key: string, id: string) => {
    const cur = inc[key] ?? [];
    setInc({ ...inc, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  };
  const setScalar = (k: string, v: string) => setWs((s) => ({ ...s, [k]: v }));
  const clear = () => { setInc({}); setWs({}); go(1, {}, {}); };

  const inputCls = "w-full rounded-md border border-border bg-input px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/40";

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex items-center gap-3 bg-primary px-5 py-3 text-primary-foreground">
        <a href="/" className="font-bold text-lg hover:no-underline">Archive of Our Own</a>
        <Badge variant="outline" className="ml-auto border-white/30 text-primary-foreground">React · Inertia spike</Badge>
      </header>

      <div className="mx-auto grid max-w-[1180px] grid-cols-[290px_1fr] gap-7 px-5 pt-6 pb-16">
        <aside className="sticky top-4 self-start">
          <Card className="max-h-[calc(100svh-2rem)] gap-0 overflow-auto px-4">
            <div className="flex items-center gap-2 pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Sort & Filter {busy && <span className="text-primary">…</span>}
            </div>

            <FacetSection title="Sort by">
              <select value={ws.sort_column ?? "_score"} onChange={(e) => setScalar("sort_column", e.target.value)} className={inputCls}>
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </FacetSection>

            <FacetSection title="Completion Status">
              <div className="grid gap-1">
                {[["", "All works"], ["T", "Complete only"], ["F", "Works in progress"]].map(([v, l]) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted">
                    <input type="radio" name="complete" checked={(ws.complete ?? "") === v} onChange={() => setScalar("complete", v)} className="accent-primary" />
                    <span className="text-sm">{l}</span>
                  </label>
                ))}
              </div>
            </FacetSection>

            <FacetSection title="Word Count">
              <div className="grid grid-cols-2 gap-1.5">
                <input type="number" placeholder="From" value={ws.words_from ?? ""} onChange={(e) => setScalar("words_from", e.target.value)} className={inputCls} />
                <input type="number" placeholder="To" value={ws.words_to ?? ""} onChange={(e) => setScalar("words_to", e.target.value)} className={inputCls} />
              </div>
            </FacetSection>

            <FacetSection title="Search within results">
              <input type="text" placeholder="Keywords" value={ws.query ?? ""} onChange={(e) => setScalar("query", e.target.value)} onKeyDown={(e) => e.key === "Enter" && go(1)} className={inputCls} />
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
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">{n(pagination.count)} works · page {pagination.page} of {pagination.pages}</p>
          {works.length === 0 && <p className="py-6 text-muted-foreground">No works matched these filters.</p>}
          <ol className="grid gap-3.5">{works.map((w) => <li key={w.id}><Blurb w={w} /></li>)}</ol>
          {pagination.pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1 || busy} onClick={() => go(pagination.page - 1)}>← Prev</Button>
              <span className="tabular-nums">Page {pagination.page} / {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages || busy} onClick={() => go(pagination.page + 1)}>Next →</Button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
