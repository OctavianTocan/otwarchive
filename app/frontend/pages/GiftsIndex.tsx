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
  context: { heading: string };
  works: WorkBlurb[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "outline"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function Blurb({ w }: { w: WorkBlurb }) {
  const scaryWarnings = w.warnings.filter((x) => x.name !== "No Archive Warnings Apply");
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
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
          <Badge variant={scaryWarnings.length > 0 ? "destructive" : "outline"}>{scaryWarnings.length > 0 ? "⚠" : "✓"}</Badge>
          {w.categories[0] && <Badge variant="outline">{w.categories.map((c) => c.name).join(", ")}</Badge>}
          <Badge variant="outline">{w.complete ? "Complete" : "WIP"}</Badge>
        </div>
      </div>

      {w.fandoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">{w.fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}</div>
      )}

      {(scaryWarnings.length > 0 || w.relationships.length > 0 || w.characters.length > 0 || w.freeforms.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {scaryWarnings.map((t, i) => <TagBadge key={`w${i}`} t={t} variant="destructive" />)}
          {[...w.relationships, ...w.characters, ...w.freeforms].map((t, i) => <TagBadge key={`t${i}`} t={t} variant="outline" />)}
        </div>
      )}

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

function buildUrl(page: number) {
  const p = new URLSearchParams(window.location.search);
  if (page > 1) p.set("page", String(page)); else p.delete("page");
  const q = p.toString();
  return q ? `${window.location.pathname}?${q}` : window.location.pathname;
}

export default function GiftsIndex({ context, works, pagination }: Props) {
  const [busy, setBusy] = useState(false);

  const go = (page: number) => {
    setBusy(true);
    router.get(buildUrl(page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  return (
    <AppShell>

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main>
          <h2 className="font-bold text-2xl">{context.heading}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">{n(pagination.count)} works · page {pagination.page} of {pagination.pages}</p>
          {works.length === 0 && <p className="py-6 text-muted-foreground">No works have been gifted here yet.</p>}
          <ol className="flex flex-col divide-y divide-border">{works.map((w) => <li key={w.id}><Blurb w={w} /></li>)}</ol>
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
