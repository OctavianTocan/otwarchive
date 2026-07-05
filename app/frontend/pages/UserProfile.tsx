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
type Pseud = { name: string; url: string | null };
type SeriesRef = { id: number; title: string; url: string | null; summaryHtml: string | null };
type FandomRef = { name: string; url: string | null; count: number | null };
type Props = {
  context: { heading: string; login: string };
  pseuds: Pseud[];
  bioHtml: string | null;
  joined: string | null;
  counts: { works: number; bookmarks: number };
  recentWorks: WorkBlurb[];
  recentSeries: SeriesRef[];
  fandoms: FandomRef[];
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "secondary"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function Blurb({ w }: { w: WorkBlurb }) {
  const hasWarnings = w.warnings.some((x) => x.name !== "No Archive Warnings Apply");
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
          <Badge variant={hasWarnings ? "destructive" : "outline"}>{hasWarnings ? "⚠" : "✓"}</Badge>
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
        <span><dt className="inline font-semibold">Kudos:</dt> <dd className="inline">{n(w.stats.kudos)}</dd></span>
        <span><dt className="inline font-semibold">Hits:</dt> <dd className="inline">{n(w.stats.hits)}</dd></span>
      </dl>
    </Card>
  );
}

function SeriesCard({ s }: { s: SeriesRef }) {
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <h4 className="min-w-0 break-words font-semibold text-base leading-snug">
        {s.url
          ? <a href={s.url} className="text-link hover:underline">{s.title}</a>
          : <span>{s.title}</span>}
      </h4>
      {s.summaryHtml && (
        <blockquote
          className="border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1"
          dangerouslySetInnerHTML={{ __html: s.summaryHtml }}
        />
      )}
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 font-bold text-lg">{title}</h3>
      {children}
    </section>
  );
}

export default function UserProfile({ context, pseuds, bioHtml, joined, counts, recentWorks, recentSeries, fandoms }: Props) {
  const empty = recentWorks.length === 0 && recentSeries.length === 0 && fandoms.length === 0;

  return (
    <AppShell>

      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <main>
          <Card className="px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="break-words font-bold text-2xl">{context.heading || context.login}</h2>
                {pseuds.length > 0 && (
                  <p className="mt-1 flex flex-wrap gap-x-1.5 gap-y-1 text-muted-foreground text-sm">
                    <span>Pseuds:</span>
                    {pseuds.map((p, i) => (
                      <span key={i}>
                        {i > 0 && ", "}
                        {p.url
                          ? <a href={p.url} className="text-link hover:underline">{p.name}</a>
                          : <span>{p.name}</span>}
                      </span>
                    ))}
                  </p>
                )}
                {joined && <p className="mt-1 text-muted-foreground text-sm tabular-nums">Joined {joined}</p>}
              </div>
              <dl className="flex shrink-0 gap-4 text-muted-foreground text-sm tabular-nums">
                <span><dt className="inline font-semibold">Works:</dt> <dd className="inline">{n(counts.works)}</dd></span>
                <span><dt className="inline font-semibold">Bookmarks:</dt> <dd className="inline">{n(counts.bookmarks)}</dd></span>
              </dl>
            </div>

            {bioHtml && (
              <div
                className="mt-1 border-border border-t border-dashed pt-3 text-foreground/90 text-sm [&_p]:my-1"
                dangerouslySetInnerHTML={{ __html: bioHtml }}
              />
            )}
          </Card>

          {fandoms.length > 0 && (
            <Section title="Fandoms">
              <div className="flex flex-wrap gap-1.5">
                {fandoms.map((f, i) => (
                  <Badge key={i} variant="secondary" render={<a href={f.url ?? "#"} />}>
                    {f.name}{f.count != null && <span className="ml-1 opacity-70 tabular-nums">({n(f.count)})</span>}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {recentWorks.length > 0 && (
            <Section title="Recent works">
              <ol className="flex flex-col divide-y divide-border">{recentWorks.map((w) => <li key={w.id}><Blurb w={w} /></li>)}</ol>
            </Section>
          )}

          {recentSeries.length > 0 && (
            <Section title="Recent series">
              <ol className="flex flex-col divide-y divide-border">{recentSeries.map((s) => <li key={s.id}><SeriesCard s={s} /></li>)}</ol>
            </Section>
          )}

          {empty && (
            <p className="py-8 text-muted-foreground">There are no works or bookmarks under this name yet.</p>
          )}
        </main>
      </div>
    </AppShell>
  );
}
