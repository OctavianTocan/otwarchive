import AppShell from "../components/AppShell";
import { Badge } from "@/design-system/components/ui/badge";
type TagRef = { name: string; url: string | null };
type Props = {
  context: { heading: string };
  bookmarkable: { type: string; title: string; url: string | null; blurb: { authors?: { name: string; url: string | null }[]; fandoms?: TagRef[]; summaryHtml?: string | null; stats?: Record<string, number | string> } | null };
  bookmarker: { name: string | null; url: string | null };
  notesHtml: string | null; tags: TagRef[]; rec: boolean; private: boolean; created: string | null;
};
export default function BookmarkShow({ context, bookmarkable, bookmarker, notesHtml, tags, rec, private: isPrivate, created }: Props) {
  const b = bookmarkable.blurb;
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-lg"><a href={bookmarkable.url ?? "#"} className="text-link hover:underline">{bookmarkable.title}</a></h2>
          {bookmarkable.type !== "Work" && <Badge variant="secondary">{bookmarkable.type}</Badge>}
        </div>
        {b?.authors && <p className="text-muted-foreground text-sm">by {b.authors.map((a) => a.name).join(", ")}</p>}
        {b?.fandoms && b.fandoms.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">{b.fandoms.map((f, i) => <a key={i} href={f.url ?? "#"} className="rounded-md border border-border px-2 py-0.5 text-link text-xs hover:underline">{f.name}</a>)}</div>
        )}
        {b?.summaryHtml && <div className="userstuff mt-3 text-foreground/90 text-sm" dangerouslySetInnerHTML={{ __html: b.summaryHtml }} />}

        <div className="mt-6 border-border border-t pt-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Bookmarked by</span>
            <a href={bookmarker.url ?? "#"} className="font-medium text-link hover:underline">{bookmarker.name ?? "Unknown"}</a>
            {rec && <Badge variant="secondary">Rec</Badge>}
            {isPrivate && <Badge variant="outline">Private</Badge>}
            {created && <span className="text-muted-foreground text-xs">{created}</span>}
          </div>
          {tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{tags.map((t, i) => <a key={i} href={t.url ?? "#"} className="rounded-md border border-border px-2 py-0.5 text-link text-xs hover:underline">{t.name}</a>)}</div>}
          {notesHtml && <div className="userstuff mt-3 text-sm" dangerouslySetInnerHTML={{ __html: notesHtml }} />}
        </div>
      </div>
    </AppShell>
  );
}
