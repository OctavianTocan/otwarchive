import AppShellHeader from "../components/AppShellHeader";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";

type TagRef = { name: string; url: string | null; type: string };
type Person = { name: string; url: string | null };
type WorkBlurb = {
  id: number;
  title: string;
  url: string;
  authors: Person[];
  anonymous: boolean;
  fandoms: TagRef[];
  ratings: TagRef[];
  warnings: TagRef[];
  categories: TagRef[];
  relationships: TagRef[];
  characters: TagRef[];
  freeforms: TagRef[];
  summaryHtml: string | null;
  stats: { language?: string; words?: number; chapters?: string; comments?: number; kudos?: number; bookmarks?: number; hits?: number };
  published?: string;
  updated?: string;
  complete?: boolean;
};
type SeriesWork = { part: number | null; blurb: WorkBlurb };
type Props = {
  context: { heading: string };
  title: string;
  creators: Person[];
  summaryHtml: string | null;
  notesHtml: string | null;
  stats: { works: number; words: number; complete: boolean };
  updated: string | null;
  fandoms: TagRef[];
  works: SeriesWork[];
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "outline"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function WorkCard({ part, w }: { part: number | null; w: WorkBlurb }) {
  const hasWarnings = w.warnings.some((x) => x.name !== "No Archive Warnings Apply");
  return (
    <Card className="px-5 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words font-semibold text-base leading-snug">
          {part != null && <span className="mr-1.5 font-normal text-muted-foreground tabular-nums">Part {part}</span>}
          <a href={w.url} className="text-link hover:underline">{w.title}</a>
          <span className="font-normal text-muted-foreground"> by </span>
          {w.authors.map((a, i) => (
            <span key={i}>{i > 0 && ", "}<a href={a.url ?? "#"} className="text-link hover:underline">{a.name}</a></span>
          ))}
        </h4>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {w.ratings[0] && <Badge variant="outline">{w.ratings[0].name}</Badge>}
          <Badge variant={hasWarnings ? "destructive" : "outline"}>{hasWarnings ? "⚠" : "✓"}</Badge>
          {w.categories[0] && <Badge variant="outline">{w.categories.map((c) => c.name).join(", ")}</Badge>}
          <Badge variant="outline">{w.complete ? "Complete" : "WIP"}</Badge>
        </div>
      </div>

      {w.fandoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">{w.fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}</div>
      )}

      <div className="flex flex-wrap gap-1">
        {w.warnings.filter((x) => x.name !== "No Archive Warnings Apply").map((t, i) => <TagBadge key={`w${i}`} t={t} variant="destructive" />)}
        {[...w.relationships, ...w.characters, ...w.freeforms].map((t, i) => <TagBadge key={`t${i}`} t={t} variant="outline" />)}
      </div>

      {w.summaryHtml && <div className="text-foreground/90 text-sm [&_p]:my-1" dangerouslySetInnerHTML={{ __html: w.summaryHtml }} />}

      <dl className="flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
        {w.stats.language && <span><dt className="inline font-semibold">Language:</dt> <dd className="inline">{w.stats.language}</dd></span>}
        <span><dt className="inline font-semibold">Words:</dt> <dd className="inline">{n(w.stats.words)}</dd></span>
        <span><dt className="inline font-semibold">Chapters:</dt> <dd className="inline">{w.stats.chapters}</dd></span>
        <span><dt className="inline font-semibold">Kudos:</dt> <dd className="inline">{n(w.stats.kudos)}</dd></span>
        <span><dt className="inline font-semibold">Hits:</dt> <dd className="inline">{n(w.stats.hits)}</dd></span>
      </dl>
    </Card>
  );
}

export default function SeriesShow({ context, title, creators, summaryHtml, notesHtml, stats, updated, fandoms, works }: Props) {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <AppShellHeader />

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main className="flex flex-col gap-5">
          <header className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <h2 className="min-w-0 break-words font-bold text-2xl leading-tight">{title}</h2>
              <div className="flex shrink-0 flex-wrap gap-1 sm:justify-end">
                <Badge variant={stats.complete ? "secondary" : "outline"}>{stats.complete ? "Complete" : "In Progress"}</Badge>
              </div>
            </div>

            {creators.length > 0 && (
              <p className="text-muted-foreground text-sm">
                by{" "}
                {creators.map((c, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    {c.url ? <a href={c.url} className="text-link hover:underline">{c.name}</a> : c.name}
                  </span>
                ))}
              </p>
            )}

            {fandoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}</div>
            )}

            <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground text-sm tabular-nums">
              <span><dt className="inline font-semibold">Works:</dt> <dd className="inline">{n(stats.works)}</dd></span>
              <span><dt className="inline font-semibold">Words:</dt> <dd className="inline">{n(stats.words)}</dd></span>
              {updated && <span><dt className="inline font-semibold">Updated:</dt> <dd className="inline">{updated}</dd></span>}
            </dl>
          </header>

          {summaryHtml && (
            <Card className="px-5">
              <h3 className="font-semibold text-base">Description</h3>
              <blockquote className="text-foreground/90 text-sm [&_p]:my-1" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
            </Card>
          )}

          {notesHtml && (
            <Card className="px-5">
              <h3 className="font-semibold text-base">Notes</h3>
              <blockquote className="text-foreground/90 text-sm [&_p]:my-1" dangerouslySetInnerHTML={{ __html: notesHtml }} />
            </Card>
          )}

          <section className="flex flex-col gap-3.5">
            <h3 className="font-semibold text-lg">Works in this series</h3>
            {works.length === 0 && <p className="py-6 text-muted-foreground">No works to show.</p>}
            <ol className="grid gap-3.5">
              {works.map((sw) => (
                <li key={sw.blurb.id}><WorkCard part={sw.part} w={sw.blurb} /></li>
              ))}
            </ol>
          </section>
        </main>
      </div>
    </div>
  );
}
