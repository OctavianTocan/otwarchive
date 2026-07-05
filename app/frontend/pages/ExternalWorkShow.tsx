import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";

type TagRef = { name: string; url: string | null; type: string };
type Props = {
  context: { heading: string };
  title: string;
  externalUrl: string | null;
  author: string | null;
  fandoms: TagRef[];
  ratings: TagRef[];
  warnings: TagRef[];
  categories: TagRef[];
  summaryHtml: string | null;
};

const REAL_WARNINGS = (ws: TagRef[]) => ws.filter((x) => x.name !== "No Archive Warnings Apply");

function TagBadge({ t, variant }: { t: TagRef; variant?: "secondary" | "outline" | "destructive" }) {
  return t.url ? (
    <Badge variant={variant ?? "secondary"} render={<a href={t.url} />}>{t.name}</Badge>
  ) : (
    <Badge variant={variant ?? "secondary"}>{t.name}</Badge>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 py-0.5">
      <dt className="min-w-[7rem] font-semibold text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap items-center gap-1">{children}</dd>
    </div>
  );
}

export default function ExternalWorkShow({
  title,
  externalUrl,
  author,
  fandoms,
  ratings,
  warnings,
  categories,
  summaryHtml,
}: Props) {
  const realWarnings = REAL_WARNINGS(warnings);
  const hasWarnings = realWarnings.length > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-[880px] px-4 md:px-5 pt-6 pb-16">
        <Card className="px-6 py-5">
          {/* Preface */}
          <div>
            <h1 className="font-bold text-2xl leading-tight">
              {externalUrl ? (
                <a href={externalUrl} className="text-link hover:underline">{title}</a>
              ) : (
                title
              )}
            </h1>
            {author && <p className="mt-1 text-muted-foreground">by {author}</p>}

            {/* Required tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ratings.map((t, i) => <Badge key={`r${i}`} variant="outline">{t.name}</Badge>)}
              <Badge variant={hasWarnings ? "destructive" : "outline"}>
                {hasWarnings ? "⚠ Warnings apply" : "✓ No Archive Warnings"}
              </Badge>
              {categories.map((t, i) => <Badge key={`c${i}`} variant="outline">{t.name}</Badge>)}
            </div>
          </div>

          <p className="mt-3 text-muted-foreground text-sm">
            This work isn't hosted on the Archive, so this blurb might not be complete or accurate.
          </p>

          {/* Associations / tags */}
          <dl className="mt-4 border-border border-t border-dashed pt-4 text-sm">
            {fandoms.length > 0 && <MetaRow label="Fandoms">{fandoms.map((t, i) => <TagBadge key={i} t={t} variant="secondary" />)}</MetaRow>}
            {hasWarnings && <MetaRow label="Warnings">{realWarnings.map((t, i) => <TagBadge key={i} t={t} variant="destructive" />)}</MetaRow>}
          </dl>

          {/* Summary */}
          {summaryHtml && (
            <div className="mt-4 border-border border-t border-dashed pt-4">
              <h3 className="font-semibold text-muted-foreground text-sm">Summary</h3>
              <blockquote
                className="mt-1 border-border border-l-2 pl-3 text-foreground/90 [&_p]:my-2 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: summaryHtml }}
              />
            </div>
          )}

          {/* Link out + bookmark note */}
          <div className="mt-4 border-border border-t border-dashed pt-4">
            {externalUrl && (
              <p className="text-sm">
                <a href={externalUrl} className="text-link hover:underline">Read this work on the external site →</a>
              </p>
            )}
            <p className="mt-2 text-muted-foreground text-sm">
              You can bookmark this external work on the Archive without it being hosted here.
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
