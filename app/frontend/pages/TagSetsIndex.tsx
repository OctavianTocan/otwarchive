import { router } from "@inertiajs/react";
import AppShell from "../components/AppShell";
import { useState } from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";

type Owner = { name: string | null; url: string | null };
type TagSet = {
  id: number;
  title: string;
  url: string | null;
  owners: Owner[];
  descriptionHtml: string | null;
  counts: { fandoms: number; characters: number; relationships: number; freeforms: number };
};
type Props = {
  context: { heading: string };
  tagSets: TagSet[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function buildUrl(page: number) {
  const p = new URLSearchParams(window.location.search);
  if (page > 1) p.set("page", String(page));
  else p.delete("page");
  const qs = p.toString();
  return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
}

function TagSetRow({ ts }: { ts: TagSet }) {
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words font-semibold text-[15px] leading-snug">
          {ts.url
            ? <a href={ts.url} className="text-link hover:underline">{ts.title}</a>
            : <span>{ts.title}</span>}
        </h4>
      </div>

      {ts.owners.length > 0 && (
        <p className="text-muted-foreground text-sm">
          <span className="font-normal">by </span>
          {ts.owners.map((o, i) => (
            <span key={i}>
              {i > 0 && ", "}
              {o.url
                ? <a href={o.url} className="font-medium text-link hover:underline">{o.name}</a>
                : <span className="font-medium">{o.name ?? "unknown"}</span>}
            </span>
          ))}
        </p>
      )}

      {ts.descriptionHtml && (
        <blockquote
          className="border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1"
          dangerouslySetInnerHTML={{ __html: ts.descriptionHtml }}
        />
      )}

      <dl className="flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
        <span><dt className="inline font-semibold">Fandoms:</dt> <dd className="inline">{n(ts.counts.fandoms)}</dd></span>
        <span><dt className="inline font-semibold">Characters:</dt> <dd className="inline">{n(ts.counts.characters)}</dd></span>
        <span><dt className="inline font-semibold">Relationships:</dt> <dd className="inline">{n(ts.counts.relationships)}</dd></span>
        <span><dt className="inline font-semibold">Additional Tags:</dt> <dd className="inline">{n(ts.counts.freeforms)}</dd></span>
      </dl>
    </Card>
  );
}

export default function TagSetsIndex({ context, tagSets, pagination }: Props) {
  const [busy, setBusy] = useState(false);

  const go = (page = 1) => {
    setBusy(true);
    router.get(buildUrl(page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  return (
    <AppShell>

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main>
          <h2 className="font-semibold text-base">{context.heading || "Tag Sets"}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">
            {n(pagination.count)} tag sets · page {pagination.page} of {pagination.pages}
          </p>
          {tagSets.length === 0 && <p className="py-6 text-muted-foreground">No tag sets found.</p>}
          <ol className="flex flex-col divide-y divide-border">{tagSets.map((ts) => <li key={ts.id}><TagSetRow ts={ts} /></li>)}</ol>
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
