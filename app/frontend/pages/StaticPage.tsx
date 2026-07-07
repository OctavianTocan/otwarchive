import AppShell from "../components/AppShell";

type Props = {
  context: { heading: string };
  contentHtml: string;
};

export default function StaticPage({ contentHtml }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[820px] px-4 pt-6 pb-16 md:px-5">
        <article className="ao3-prose text-[15px] text-foreground/90" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </AppShell>
  );
}
