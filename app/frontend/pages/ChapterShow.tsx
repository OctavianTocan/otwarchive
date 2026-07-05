import { Card } from "@/design-system/components/ui/card";
import AppShell from "../components/AppShell";
import KudosButton from "../components/KudosButton";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type TagRef = { name: string; url: string | null; type: string };
type ChapterRef = { position: number; title: string | null; url: string | null };
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
  language: string | null;
  published?: string;
  updated?: string;
  stats: { language?: string; words?: number; chapters?: string; comments?: number; kudos?: number; bookmarks?: number; hits?: number };
  chapter: {
    id: number;
    position: number;
    header: string | null;
    title: string | null;
    contentHtml: string | null;
    summaryHtml: string | null;
    notesHtml: string | null;
    endnotesHtml: string | null;
  };
  nav: {
    prevUrl: string | null;
    nextUrl: string | null;
    index: number;
    total: number;
    chapters: ChapterRef[];
  };
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

function ChapterNav({ nav }: { nav: Props["nav"] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" size="sm" disabled={!nav.prevUrl} render={<a href={nav.prevUrl ?? "#"} />}>
        ← Previous Chapter
      </Button>
      <label className="flex items-center gap-2 text-muted-foreground text-sm">
        <span className="tabular-nums">
          Chapter {nav.index} of {nav.total}
        </span>
        <select
          className="rounded-md border border-border bg-background px-2 py-1 text-foreground text-sm"
          value={nav.index - 1}
          onChange={(e) => {
            const target = nav.chapters[Number(e.target.value)];
            if (target?.url) window.location.href = target.url;
          }}
        >
          {nav.chapters.map((c, i) => (
            <option key={c.position} value={i}>
              {c.position}. {c.title ?? `Chapter ${c.position}`}
            </option>
          ))}
        </select>
      </label>
      <Button variant="outline" size="sm" disabled={!nav.nextUrl} render={<a href={nav.nextUrl ?? "#"} />}>
        Next Chapter →
      </Button>
    </div>
  );
}

export default function ChapterShow(props: Props) {
  const { work, chapter, nav, stats, kudosNames, kudosCount, workskinCss } = props;
  const warnings = REAL_WARNINGS(work.warnings);
  const hasWarnings = warnings.length > 0;
  const multi = nav.total > 1;

  return (
    <AppShell>
      {workskinCss && <style dangerouslySetInnerHTML={{ __html: scopeCss(workskinCss) }} />}

      <div className="mx-auto max-w-[880px] px-5 pt-6 pb-16">
        <Card className="px-6 py-5">
          {/* Work preface */}
          <div>
            <h1 className="font-bold text-2xl leading-tight">
              {work.restricted && <span title="Restricted" className="mr-1 align-middle text-base">🔒</span>}
              <a href={work.url ?? "#"} className="text-link hover:underline">{work.title}</a>
            </h1>
            <p className="mt-1 text-muted-foreground">
              by{" "}
              {work.authors.map((a, i) => (
                <span key={i}>{i > 0 && ", "}<a href={a.url ?? "#"} className="text-link hover:underline">{a.name}</a></span>
              ))}
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

          {/* Work summary */}
          {props.summaryHtml && (
            <div className="mt-4 border-border border-t border-dashed pt-4">
              <h3 className="font-semibold text-muted-foreground text-sm">Summary</h3>
              <blockquote className="mt-1 border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={props.summaryHtml} /></blockquote>
            </div>
          )}
        </Card>

        {/* Chapter navigation (top) */}
        <Card className="mt-4 px-6 py-4">
          <ChapterNav nav={nav} />
        </Card>

        {/* Chapter body (work skin applies here) */}
        <Card id="workskin" className="mt-4 px-6 py-6">
          <section>
            <header className="mb-4 border-border border-b pb-3">
              <h2 className="font-semibold text-xl">
                {chapter.header}
                {chapter.title && <span className="font-normal text-muted-foreground">: {chapter.title}</span>}
              </h2>
              {multi && chapter.summaryHtml && (
                <div className="mt-2">
                  <h4 className="font-semibold text-muted-foreground text-sm">Summary:</h4>
                  <blockquote className="border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={chapter.summaryHtml} /></blockquote>
                </div>
              )}
              {multi && chapter.notesHtml && (
                <div className="mt-2">
                  <h4 className="font-semibold text-muted-foreground text-sm">Notes:</h4>
                  <blockquote className="border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={chapter.notesHtml} /></blockquote>
                </div>
              )}
            </header>

            {chapter.contentHtml && <Userstuff html={chapter.contentHtml} />}

            {chapter.endnotesHtml && (
              <div className="mt-6 border-border border-t border-dashed pt-3">
                <h4 className="font-semibold text-muted-foreground text-sm">Notes:</h4>
                <blockquote className="border-border border-l-2 pl-3 text-foreground/90"><Userstuff html={chapter.endnotesHtml} /></blockquote>
              </div>
            )}
          </section>
        </Card>

        {/* Chapter navigation (bottom) */}
        <Card className="mt-4 px-6 py-4">
          <ChapterNav nav={nav} />
        </Card>

        {/* Kudos */}
        <div className="mt-6 flex flex-col gap-2 border-border border-t pt-5 text-sm">
          <div className="flex items-center gap-3">
            <KudosButton workId={(work as { id: number }).id} />
            <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Kudos ({n(kudosCount)})</h3>
          </div>
          {kudosNames.length > 0 && (
            <p className="text-foreground/90">
              {kudosNames.join(", ")}
              {kudosCount > kudosNames.length && ` and ${n(kudosCount - kudosNames.length)} more left kudos on this work!`}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-muted-foreground text-xs">
          <Button variant="outline" size="sm" render={<a href={`${chapter ? `${work.url ?? ""}/chapters/${chapter.id}` : work.url ?? "#"}?ui=legacy`} />}>View legacy page</Button>
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
