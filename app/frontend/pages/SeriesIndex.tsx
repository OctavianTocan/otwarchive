import { router } from "@inertiajs/react";
import AppShell from "../components/AppShell";
import { useState } from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type TagRef = { name: string; url: string | null; type: string };
type Series = {
  id: number;
  title: string;
  url: string | null;
  creators: { name: string; url: string | null }[];
  summaryHtml: string | null;
  fandoms: TagRef[];
  stats: { works: number; words: number };
  complete: boolean;
  updated: string | null;
};
type Props = {
  context: { heading: string; ownerName: string | null };
  series: Series[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "outline"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function SeriesCard({ s }: { s: Series }) {
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words min-w-0 break-words font-semibold text-base leading-snug">
          {s.url ? <a href={s.url} className="text-link hover:underline">{s.title}</a> : s.title}
          <span className="font-normal text-muted-foreground"> by </span>
          {s.creators.map((c, i) => (
            <span key={i}>{i > 0 && ", "}<a href={c.url ?? "#"} className="text-link hover:underline">{c.name}</a></span>
          ))}
        </h4>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <Badge variant="outline">{s.complete ? "Complete" : "WIP"}</Badge>
        </div>
      </div>

      {s.fandoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">{s.fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}</div>
      )}

      {s.summaryHtml && (
        <blockquote className="border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1" dangerouslySetInnerHTML={{ __html: s.summaryHtml }} />
      )}

      <dl className="flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
        <span><dt className="inline font-semibold">Works:</dt> <dd className="inline">{n(s.stats.works)}</dd></span>
        <span><dt className="inline font-semibold">Words:</dt> <dd className="inline">{n(s.stats.words)}</dd></span>
        {s.updated && <span className="ml-auto"><dt className="inline font-semibold">Updated:</dt> <dd className="inline">{s.updated}</dd></span>}
      </dl>
    </Card>
  );
}

function buildUrl(page: number) {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `${window.location.pathname}?${q}` : window.location.pathname;
}

export default function SeriesIndex({ context, series, pagination }: Props) {
  const [busy, setBusy] = useState(false);

  const go = (page: number) => {
    setBusy(true);
    router.get(buildUrl(page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  return (
    <AppShell>

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main>
          <h2 className="font-bold text-2xl">{context.heading || context.ownerName}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">{n(pagination.count)} series · page {pagination.page} of {pagination.pages}</p>
          {series.length === 0 && <p className="py-6 text-muted-foreground">No series to show.</p>}
          <ol className="flex flex-col divide-y divide-border">{series.map((s) => <li key={s.id}><SeriesCard s={s} /></li>)}</ol>
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
