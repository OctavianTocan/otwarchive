import { Card } from "@/design-system/components/ui/card";
import AppShell from "./AppShell";

type Item = { title: string; url: string };

/** A simple index of content links (FAQ/known-issues/guidelines style). */
export function ContentList({ heading, items, intro }: { heading: string; items: Item[]; intro?: string }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="mb-1 font-bold text-2xl">{heading}</h2>
        {intro && <p className="mb-4 text-muted-foreground">{intro}</p>}
        {items.length === 0 && <p className="py-6 text-muted-foreground">Nothing here yet.</p>}
        <Card className="gap-0 px-5 py-2">
          <ul className="divide-border divide-y">
            {items.map((it, i) => (
              <li key={i} className="py-2.5">
                <a href={it.url} className="text-link hover:underline">{it.title}</a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

/** A single content article (title + sanitized HTML body). */
export function ContentArticle({ heading, title, contentHtml, indexUrl }: { heading?: string; title: string; contentHtml: string | null; indexUrl?: string }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        {indexUrl && <a href={indexUrl} className="text-link text-sm hover:underline">← {heading ?? "Back"}</a>}
        <h2 className="mt-1 mb-4 font-bold text-2xl">{title}</h2>
        <Card className="px-6 py-5">
          <div className="userstuff [&_a]:text-link [&_a:hover]:underline" dangerouslySetInnerHTML={{ __html: contentHtml ?? "" }} />
        </Card>
      </div>
    </AppShell>
  );
}
