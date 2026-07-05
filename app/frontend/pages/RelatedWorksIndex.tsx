import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
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
type ParentRef = { title: string | null; url: string | null; external: boolean; unrevealed: boolean };
type Relationship = {
  kind: "translation" | "inspired";
  approved: boolean;
  parent: ParentRef | null;
  languageFrom: string | null;
  languageTo: string | null;
};
type Item = { id: number; groupLabel: string; blurb: WorkBlurb | null; relationship: Relationship };
type Props = {
  context: { heading: string };
  items: Item[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "outline"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function ParentLink({ p }: { p: ParentRef | null }) {
  if (!p) return null;
  if (p.unrevealed || !p.title) return <span className="italic">a work in an unrevealed collection</span>;
  return p.url
    ? <a href={p.url} className="text-link hover:underline">{p.title}</a>
    : <span>{p.title}</span>;
}

function RelationshipLine({ r }: { r: Relationship }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
      <span>
        {r.kind === "translation" ? "Translation of " : "Inspired by "}
        <ParentLink p={r.parent} />
      </span>
      {r.kind === "translation" && r.languageFrom && r.languageTo && (
        <span className="tabular-nums">· {r.languageFrom} → {r.languageTo}</span>
      )}
      <Badge variant={r.approved ? "outline" : "secondary"}>{r.approved ? "Approved" : "Unapproved"}</Badge>
    </div>
  );
}

function Blurb({ w }: { w: WorkBlurb }) {
  const scaryWarnings = w.warnings.filter((x) => x.name !== "No Archive Warnings Apply");
  return (
    <div className="flex flex-col gap-2">
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
    </div>
  );
}

function ItemRow({ item }: { item: Item }) {
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <div className="flex flex-col gap-3">
        <RelationshipLine r={item.relationship} />
        {item.blurb
          ? <Blurb w={item.blurb} />
          : <p className="italic text-muted-foreground">A work in an unrevealed collection</p>}
      </div>
    </Card>
  );
}

export default function RelatedWorksIndex({ context, items, pagination }: Props) {
  // The controller emits items already grouped by section label; collect
  // consecutive runs of the same label into the four ERB sections.
  const sections: { label: string; items: Item[] }[] = [];
  for (const item of items) {
    const last = sections[sections.length - 1];
    if (last && last.label === item.groupLabel) last.items.push(item);
    else sections.push({ label: item.groupLabel, items: [item] });
  }

  return (
    <AppShell>

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main>
          <h2 className="font-bold text-2xl">{context.heading}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">{n(pagination.count)} related works</p>
          {items.length === 0 && <p className="py-6 text-muted-foreground">No related works to show.</p>}
          {sections.map((section) => (
            <section key={section.label}>
              <h3 className="mt-6 mb-2 font-semibold text-muted-foreground text-sm uppercase tracking-wide">{section.label}</h3>
              <ol className="grid overflow-hidden rounded-lg border border-border bg-card">
                {section.items.map((item) => <li key={item.id}><ItemRow item={item} /></li>)}
              </ol>
            </section>
          ))}
        </main>
      </div>
    </AppShell>
  );
}
