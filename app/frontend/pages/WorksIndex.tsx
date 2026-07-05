import { router } from "@inertiajs/react";
import WorkSheet from "../components/WorkSheet";
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

function Blurb({ w, onOpen }: { w: WorkBlurb; onOpen?: (w: WorkBlurb) => void }) {
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words min-w-0 break-words font-semibold text-[15px] leading-snug">
          <a href={w.url} className="text-link hover:underline" onClick={(e) => { if (onOpen && typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) { e.preventDefault(); onOpen(w); } }}>{w.title}</a>
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
  const [sheet, setSheet] = useState<{ id: number; url: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    <AppShell>

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-4 pt-6 pb-16 md:grid-cols-[290px_1fr] md:gap-7 md:px-5">
        <aside className="self-start md:sticky md:top-4">
          <Card className="max-h-[calc(100svh-2rem)] gap-0 overflow-auto px-4">
            <button type="button" onClick={() => setFiltersOpen((o) => !o)}
              className="flex w-full items-center gap-2 pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide md:pointer-events-none">
              Sort & Filter {busy && <span className="text-link">…</span>}
              <span className="ml-auto text-sm md:hidden">{filtersOpen ? "▲" : "▼"}</span>
            </button>

            <div className={(filtersOpen ? "block" : "hidden") + " md:block"}>
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
            </div>
          </Card>
        </aside>

        <main>
          <h2 className="font-semibold text-base">{context.heading || context.ownerName}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">{n(pagination.count)} works · page {pagination.page} of {pagination.pages}</p>
          {works.length === 0 && <p className="py-6 text-muted-foreground">No works matched these filters.</p>}
          <ol className="flex flex-col divide-y divide-border">{works.map((w) => <li key={w.id}><Blurb w={w} onOpen={(x) => setSheet({ id: x.id, url: x.url })} /></li>)}</ol>
          {pagination.pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1 || busy} onClick={() => go(pagination.page - 1)}>← Prev</Button>
              <span className="tabular-nums">Page {pagination.page} / {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages || busy} onClick={() => go(pagination.page + 1)}>Next →</Button>
            </nav>
          )}
        </main>
      </div>
      <WorkSheet workId={sheet?.id ?? null} workUrl={sheet?.url ?? null} onClose={() => setSheet(null)} />
    </AppShell>
  );
}
