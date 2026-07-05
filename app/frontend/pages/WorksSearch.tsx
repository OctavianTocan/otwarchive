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
type Props = {
  context: { heading: string; query: string | null; summary: string | null };
  works: WorkBlurb[];
  pagination: { page: number; pages: number; count: number };
  resultCount: number;
  filters: { work_search: { query?: string } };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function buildUrl(query: string, page: number) {
  const p = new URLSearchParams();
  if (query) p.set("work_search[query]", query);
  if (page > 1) p.set("page", String(page));
  return `${window.location.pathname}?${p.toString()}`;
}

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "secondary"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function Blurb({ w }: { w: WorkBlurb }) {
  return (
    <Card className="px-5 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words font-semibold text-base leading-snug">
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

export default function WorksSearch({ context, works, pagination, resultCount, filters }: Props) {
  const [query, setQuery] = useState<string>(filters.work_search?.query ?? "");
  const [busy, setBusy] = useState(false);

  const go = (page = 1, q = query) => {
    setBusy(true);
    router.get(buildUrl(q, page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  const inputCls = "w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/40";

  return (
    <AppShell>

      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="font-bold text-2xl">{context.heading || "Search Works"}</h2>

        <Card className="mt-4 px-5">
          <label htmlFor="work_search_query" className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Search all works
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="work_search_query"
              type="text"
              placeholder="Any field: title, author, tags, summary…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go(1)}
              className={inputCls}
            />
            <Button variant="default" size="sm" onClick={() => go(1)} disabled={busy}>
              {busy ? "Searching…" : "Search"}
            </Button>
          </div>
          {context.summary && (
            <p className="text-muted-foreground text-sm">You searched for: <span className="text-foreground">{context.summary}</span></p>
          )}
        </Card>

        <p className="mt-5 mb-4 text-muted-foreground tabular-nums">
          {n(resultCount)} {resultCount === 1 ? "work found" : "works found"}
          {pagination.pages > 1 && <> · page {pagination.page} of {pagination.pages}</>}
        </p>

        {works.length === 0 ? (
          <p className="py-6 text-muted-foreground">No results found. You may want to edit your search to make it less specific.</p>
        ) : (
          <ol className="grid gap-3.5">{works.map((w) => <li key={w.id}><Blurb w={w} /></li>)}</ol>
        )}

        {pagination.pages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1 || busy} onClick={() => go(pagination.page - 1)}>← Prev</Button>
            <span className="tabular-nums">Page {pagination.page} / {pagination.pages}</span>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages || busy} onClick={() => go(pagination.page + 1)}>Next →</Button>
          </nav>
        )}
      </div>
    </AppShell>
  );
}
