import { Card } from "@/design-system/components/ui/card";
import AppShell from "../components/AppShell";
import KudosButton from "../components/KudosButton";
import SubscribeButton from "../components/SubscribeButton";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type TagRef = { name: string; url: string | null; type: string };
type Chapter = {
  id: number;
  position: number;
  title: string | null;
  header: string | null;
  contentHtml: string | null;
  summaryHtml: string | null;
  notesHtml: string | null;
  endnotesHtml: string | null;
};
type Props = {
  pageTitle: string;
  work: {
    id: number;
    title: string;
    url: string | null;
    authors: { name: string; url: string | null }[];
    anonymous: boolean;
    restricted: boolean;
    complete: boolean;
    ratings: TagRef[];
    warnings: TagRef[];
    categories: TagRef[];
    fandoms: TagRef[];
    relationships: TagRef[];
    characters: TagRef[];
    freeforms: TagRef[];
  };
  summaryHtml: string | null;
  notesHtml: string | null;
  endnotesHtml: string | null;
  stats: { language?: string; words?: number; chapters?: string; comments?: number; kudos?: number; bookmarks?: number; hits?: number };
  published?: string;
  updated?: string;
  language: string | null;
  series: { name: string; url: string | null; part: number }[];
  collections: string[];
  gifts: string[];
  chapters: Chapter[];
  kudosNames: string[];
  kudosCount: number;
  workskinCss: string | null;
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");
const REAL_WARNINGS = (ws: TagRef[]) => ws.filter((x) => x.name !== "No Archive Warnings Apply");

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return <Badge variant={variant ?? "secondary"} render={<a href={t.url ?? "#"} />}>{t.name}</Badge>;
}

function Userstuff({ html }: { html: string }) {
  return <div className="userstuff [&_p]:my-2 [&_blockquote]:my-2 [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 py-0.5">
      <dt className="min-w-[7rem] font-semibold text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap items-center gap-1">{children}</dd>
    </div>
  );
}

function ChapterView({ ch, multi }: { ch: Chapter; multi: boolean }) {
  return (
    <section className="border-border border-t pt-6 first:border-t-0 first:pt-0">
      {multi && (
        <header className="mb-3">
          <h3 className="font-semibold text-base">
            {ch.header}
            {ch.title && <span className="font-normal text-muted-foreground">: {ch.title}</span>}
          </h3>
          {ch.summaryHtml && (
            <div className="mt-2">
              <h4 className="font-semibold text-muted-foreground text-sm">Summary:</h4>
              <blockquote className="border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={ch.summaryHtml} /></blockquote>
            </div>
          )}
          {ch.notesHtml && (
            <div className="mt-2">
              <h4 className="font-semibold text-muted-foreground text-sm">Notes:</h4>
              <blockquote className="border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={ch.notesHtml} /></blockquote>
            </div>
          )}
        </header>
      )}
      {ch.contentHtml && <Userstuff html={ch.contentHtml} />}
      {ch.endnotesHtml && (
        <div className="mt-4 border-border border-t border-dashed pt-3">
          <h4 className="font-semibold text-muted-foreground text-sm">Notes:</h4>
          <blockquote className="border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={ch.endnotesHtml} /></blockquote>
        </div>
      )}
    </section>
  );
}

export default function WorkShow(props: Props) {
  const { work, chapters, stats, series, collections, gifts, kudosNames, kudosCount, workskinCss } = props;
  const warnings = REAL_WARNINGS(work.warnings);
  const hasWarnings = warnings.length > 0;
  const multi = chapters.length > 1;

  return (
    <AppShell>
      {workskinCss && <style dangerouslySetInnerHTML={{ __html: scopeCss(workskinCss) }} />}

      <div className="mx-auto max-w-[880px] px-5 pt-6 pb-16">
        <Card className="px-6 py-5">
          {/* Preface */}
          <div>
            <h1 className="font-semibold text-lg leading-tight">
              {work.restricted && <span title="Restricted" className="mr-1 align-middle text-base">🔒</span>}
              <a href={work.url ?? "#"} className="text-link hover:underline">{work.title}</a>
            </h1>
            <p className="mt-1 text-muted-foreground">
              by{" "}
              {work.authors.map((a, i) => (
                <span key={i}>{i > 0 && ", "}<a href={a.url ?? "#"} className="text-link hover:underline">{a.name}</a></span>
              ))}
              {gifts.length > 0 && <span> for {gifts.join(", ")}</span>}
            </p>

            {/* Required tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {work.ratings.map((t, i) => <Badge key={`r${i}`} variant="outline">{t.name}</Badge>)}
              <Badge variant={hasWarnings ? "destructive" : "outline"}>{hasWarnings ? "⚠ Warnings apply" : "✓ No Archive Warnings"}</Badge>
              {work.categories.map((t, i) => <Badge key={`c${i}`} variant="outline">{t.name}</Badge>)}
              <Badge variant="outline">{work.complete ? "Complete" : "Work in Progress"}</Badge>
            </div>
          </div>

          {/* Associations / tags */}
          <dl className="mt-4 border-border border-t border-dashed pt-4 text-sm">
            {work.fandoms.length > 0 && <MetaRow label="Fandoms">{work.fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}</MetaRow>}
            {hasWarnings && <MetaRow label="Warnings">{warnings.map((t, i) => <TagBadge key={i} t={t} variant="destructive" />)}</MetaRow>}
            {work.relationships.length > 0 && <MetaRow label="Relationships">{work.relationships.map((t, i) => <TagBadge key={i} t={t} variant="outline" />)}</MetaRow>}
            {work.characters.length > 0 && <MetaRow label="Characters">{work.characters.map((t, i) => <TagBadge key={i} t={t} variant="outline" />)}</MetaRow>}
            {work.freeforms.length > 0 && <MetaRow label="Additional Tags">{work.freeforms.map((t, i) => <TagBadge key={i} t={t} variant="outline" />)}</MetaRow>}
            {props.language && <MetaRow label="Language">{props.language}</MetaRow>}
            {series.length > 0 && (
              <MetaRow label="Series">
                {series.map((s, i) => (
                  <span key={i}>{i > 0 && ", "}Part {s.part} of <a href={s.url ?? "#"} className="text-link hover:underline">{s.name}</a></span>
                ))}
              </MetaRow>
            )}
            {collections.length > 0 && <MetaRow label="Collections">{collections.join(", ")}</MetaRow>}
          </dl>

          {/* Stats */}
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5 border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
            {props.published && <span><dt className="inline font-semibold">Published:</dt> <dd className="inline">{props.published}</dd></span>}
            {props.updated && props.updated !== props.published && <span><dt className="inline font-semibold">Updated:</dt> <dd className="inline">{props.updated}</dd></span>}
            <span><dt className="inline font-semibold">Words:</dt> <dd className="inline">{n(stats.words)}</dd></span>
            <span><dt className="inline font-semibold">Chapters:</dt> <dd className="inline">{stats.chapters}</dd></span>
            <span><dt className="inline font-semibold">Comments:</dt> <dd className="inline">{n(stats.comments)}</dd></span>
            <span><dt className="inline font-semibold">Kudos:</dt> <dd className="inline">{n(stats.kudos)}</dd></span>
            <span><dt className="inline font-semibold">Bookmarks:</dt> <dd className="inline">{n(stats.bookmarks)}</dd></span>
            <span><dt className="inline font-semibold">Hits:</dt> <dd className="inline">{n(stats.hits)}</dd></span>
          </dl>

          {/* Work summary / notes */}
          {props.summaryHtml && (
            <div className="mt-4 border-border border-t border-dashed pt-4">
              <h3 className="font-semibold text-muted-foreground text-sm">Summary</h3>
              <blockquote className="mt-1 border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={props.summaryHtml} /></blockquote>
            </div>
          )}
          {props.notesHtml && (
            <div className="mt-3">
              <h3 className="font-semibold text-muted-foreground text-sm">Notes</h3>
              <blockquote className="mt-1 border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={props.notesHtml} /></blockquote>
            </div>
          )}
        </Card>

        {/* Chapter bodies (work skin applies here) */}
        <Card id="workskin" className="mt-4 px-6 py-6">
          <div className="flex flex-col gap-8">
            {chapters.map((ch) => <ChapterView key={ch.id} ch={ch} multi={multi} />)}
          </div>
          {props.endnotesHtml && (
            <div className="mt-8 border-border border-t pt-4">
              <h3 className="font-semibold text-muted-foreground text-sm">End Notes</h3>
              <blockquote className="mt-1 border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={props.endnotesHtml} /></blockquote>
            </div>
          )}
        </Card>

        {/* Kudos */}
        <div className="mt-6 flex flex-col gap-2 border-border border-t pt-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <KudosButton workId={(work as { id: number }).id} />
            <SubscribeButton workId={(work as { id: number }).id} />
            <Button variant="outline" size="sm" render={<a href={`${work.url ?? "#"}/bookmarks/new`} />}>☆ Bookmark</Button>
            <h3 className="ml-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Kudos ({n(kudosCount)})</h3>
          </div>
          {kudosNames.length > 0 && (
            <p className="text-foreground/90">
              {kudosNames.join(", ")}
              {kudosCount > kudosNames.length && ` and ${n(kudosCount - kudosNames.length)} more left kudos on this work!`}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-muted-foreground text-xs">
          <Button variant="outline" size="sm" render={<a href={`${work.url ?? "#"}?ui=legacy`} />}>View legacy page</Button>
        </p>
      </div>
    </AppShell>
  );
}

// Scope the work skin's author CSS under #workskin so it can't leak into the
// surrounding page chrome. AO3 authors already write rules against #workskin;
// prefix any that don't so nothing escapes the reading pane.
function scopeCss(css: string): string {
  return css.replace(/([^{}]+)(\{[^{}]*\})/g, (_m, selectors: string, body: string) => {
    const scoped = selectors
      .split(",")
      .map((s) => {
        const sel = s.trim();
        if (!sel || sel.startsWith("@")) return sel;
        if (sel.includes("#workskin")) return sel;
        return `#workskin ${sel}`;
      })
      .join(", ");
    return `${scoped} ${body}`;
  });
}
