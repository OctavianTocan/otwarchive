import AppShellHeader from "../components/AppShellHeader";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";

type Person = { name: string; url: string | null };
type Props = {
  context: { heading: string; name: string | null };
  title: string;
  descriptionHtml: string | null;
  introHtml: string | null;
  maintainers: Person[];
  counts: { works: number; bookmarks: number };
  type: string | null;
  open: boolean;
  moderated: boolean;
  closed: boolean;
  unrevealed: boolean;
  parentUrl: string | null;
  worksUrl: string | null;
  bookmarksUrl: string | null;
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

export default function CollectionShow({
  context,
  title,
  descriptionHtml,
  introHtml,
  maintainers,
  counts,
  type,
  open,
  moderated,
  unrevealed,
  parentUrl,
  worksUrl,
  bookmarksUrl,
}: Props) {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <AppShellHeader />

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main className="flex flex-col gap-5">
          <header className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <h2 className="min-w-0 break-words font-bold text-2xl leading-tight">{title}</h2>
              <div className="flex shrink-0 flex-wrap gap-1 sm:justify-end">
                <Badge variant={open ? "secondary" : "outline"}>{open ? "Open" : "Closed"}</Badge>
                <Badge variant="outline">{moderated ? "Moderated" : "Unmoderated"}</Badge>
                {unrevealed && <Badge variant="outline">Unrevealed</Badge>}
                {type && <Badge variant="secondary">{type}</Badge>}
              </div>
            </div>
            {context.name && <p className="text-muted-foreground text-sm tabular-nums">{context.name}</p>}
            {parentUrl && (
              <p className="text-muted-foreground text-sm">
                Part of a{" "}
                <a href={parentUrl} className="text-primary hover:underline">
                  parent collection
                </a>
                .
              </p>
            )}
          </header>

          {descriptionHtml && (
            <Card className="px-5">
              <blockquote
                className="text-foreground/90 text-sm [&_p]:my-1"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </Card>
          )}

          <section className="grid gap-4 sm:grid-cols-2">
            {worksUrl && (
              <Card className="px-5">
                <h3 className="font-semibold text-base">Works</h3>
                <p className="text-muted-foreground text-sm tabular-nums">{n(counts.works)} in this collection</p>
                <a href={worksUrl} className="text-primary text-sm hover:underline">
                  Browse works →
                </a>
              </Card>
            )}
            {bookmarksUrl && (
              <Card className="px-5">
                <h3 className="font-semibold text-base">Bookmarks</h3>
                <p className="text-muted-foreground text-sm tabular-nums">{n(counts.bookmarks)} in this collection</p>
                <a href={bookmarksUrl} className="text-primary text-sm hover:underline">
                  Browse bookmarks →
                </a>
              </Card>
            )}
          </section>

          {introHtml && (
            <Card className="px-5">
              <h3 className="font-semibold text-base">Intro</h3>
              <div
                className="text-foreground/90 text-sm [&_a]:text-primary [&_a]:hover:underline [&_p]:my-1"
                dangerouslySetInnerHTML={{ __html: introHtml }}
              />
            </Card>
          )}

          {maintainers.length > 0 && (
            <Card className="px-5">
              <h3 className="font-semibold text-base">Maintainers</h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {maintainers.map((m, i) => (
                  <li key={i}>
                    {m.url ? (
                      <a href={m.url} className="text-primary hover:underline">
                        {m.name}
                      </a>
                    ) : (
                      m.name
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
