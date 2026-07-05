import AppShell from "../components/AppShell";

type Props = {
  context: { heading: string };
  contentHtml: string;
};

// Renders a static AO3 content page (TOS, donate, site map, …). The server
// hands us the existing ERB body verbatim; `.ao3-prose` styles its
// .userstuff/.heading/.landmark markup. The body carries its own <h2>, so we
// don't render context.heading visibly.
export default function StaticPage({ contentHtml }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[820px] px-4 pt-6 pb-16 md:px-5">
        <article className="ao3-prose text-[15px] text-foreground/90" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </AppShell>
  );
}
