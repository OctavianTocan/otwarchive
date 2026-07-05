import AppShell from "../components/AppShell";
type Props = { context: { heading: string; indexUrl: string }; title: string; contentHtml: string | null; published: string | null; prevUrl: string | null; nextUrl: string | null };
export default function AdminPostShow({ context, title, contentHtml, published, prevUrl, nextUrl }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        <a href={context.indexUrl} className="text-link text-sm hover:underline">← News</a>
        <h2 className="mt-1 font-bold text-2xl">{title}</h2>
        {published && <p className="mt-0.5 mb-4 text-muted-foreground text-sm">{published}</p>}
        <div className="userstuff [&_a]:text-link [&_a:hover]:underline" dangerouslySetInnerHTML={{ __html: contentHtml ?? "" }} />
        <nav className="mt-8 flex justify-between border-border border-t pt-4 text-sm">
          {prevUrl ? <a href={prevUrl} className="text-link hover:underline">← Previous</a> : <span />}
          {nextUrl ? <a href={nextUrl} className="text-link hover:underline">Next →</a> : <span />}
        </nav>
      </div>
    </AppShell>
  );
}
