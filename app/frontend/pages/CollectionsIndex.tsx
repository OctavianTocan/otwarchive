import { router } from "@inertiajs/react";
import AppShellHeader from "../components/AppShellHeader";
import { useState } from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type Maintainer = { name: string | null; url: string | null };
type Collection = {
  id: number;
  title: string;
  name: string;
  url: string | null;
  descriptionHtml: string | null;
  maintainers: Maintainer[];
  counts: { works: number; bookmarks: number };
  type: string | null;
  open: boolean;
  moderated: boolean;
  closed: boolean;
  unrevealed: boolean;
  anonymous: boolean;
};
type Props = {
  context: { heading: string; ownerName: string | null };
  collections: Collection[];
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

function StatusBadges({ c }: { c: Collection }) {
  return (
    <div className="flex shrink-0 flex-wrap justify-end gap-1">
      <Badge variant={c.open ? "outline" : "secondary"}>{c.open ? "Open" : "Closed"}</Badge>
      {c.moderated && <Badge variant="outline">Moderated</Badge>}
      {c.unrevealed && <Badge variant="outline">Unrevealed</Badge>}
      {c.anonymous && <Badge variant="outline">Anonymous</Badge>}
      {c.type && <Badge variant="default">{c.type}</Badge>}
    </div>
  );
}

function CollectionCard({ c }: { c: Collection }) {
  return (
    <Card className="px-5 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words min-w-0 break-words font-semibold text-base leading-snug">
          {c.url
            ? <a href={c.url} className="text-link hover:underline">{c.title}</a>
            : <span>{c.title}</span>}
          <span className="ml-1.5 font-normal text-muted-foreground text-sm">({c.name})</span>
        </h4>
        <StatusBadges c={c} />
      </div>

      {c.maintainers.length > 0 && (
        <p className="text-muted-foreground text-sm">
          <span className="font-normal">by </span>
          {c.maintainers.map((m, i) => (
            <span key={i}>
              {i > 0 && ", "}
              {m.url
                ? <a href={m.url} className="font-medium text-link hover:underline">{m.name}</a>
                : <span className="font-medium">{m.name ?? "unknown"}</span>}
            </span>
          ))}
        </p>
      )}

      {c.descriptionHtml && (
        <blockquote
          className="border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1"
          dangerouslySetInnerHTML={{ __html: c.descriptionHtml }}
        />
      )}

      <dl className="flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
        <span><dt className="inline font-semibold">Works:</dt> <dd className="inline">{n(c.counts.works)}</dd></span>
        {c.counts.bookmarks > 0 && (
          <span><dt className="inline font-semibold">Bookmarked items:</dt> <dd className="inline">{n(c.counts.bookmarks)}</dd></span>
        )}
      </dl>
    </Card>
  );
}

export default function CollectionsIndex({ context, collections, pagination }: Props) {
  const [busy, setBusy] = useState(false);

  const go = (page = 1) => {
    setBusy(true);
    router.get(buildUrl(page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <AppShellHeader />

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main>
          <h2 className="font-bold text-2xl">{context.heading || context.ownerName || "Collections"}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">
            {n(pagination.count)} collections · page {pagination.page} of {pagination.pages}
          </p>
          {collections.length === 0 && <p className="py-6 text-muted-foreground">Sorry, there were no collections found.</p>}
          <ol className="grid gap-3.5">{collections.map((c) => <li key={c.id}><CollectionCard c={c} /></li>)}</ol>
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
