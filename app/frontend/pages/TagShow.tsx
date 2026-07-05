import AppShellHeader from "../components/AppShellHeader";
import { Badge } from "@/design-system/components/ui/badge";
import { buttonVariants } from "@/design-system/components/ui/button";
import { Card } from "@/design-system/components/ui/card";

type TagRef = { name: string; url: string | null; type: string | null };

type Props = {
  context: { heading: string };
  name: string;
  type: string;
  canonical: boolean;
  worksUrl: string | null;
  worksCount: number;
  parents: TagRef[];
  children: TagRef[];
  synonyms: TagRef[];
  merger: { name: string; url: string | null } | null;
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function TagPills({ tags }: { tags: TagRef[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t, i) => (
        <li key={i}>
          {t.url ? (
            <a href={t.url} className="text-link hover:underline">
              <Badge variant="outline">{t.name}</Badge>
            </a>
          ) : (
            <Badge variant="outline">{t.name}</Badge>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function TagShow({
  name,
  type,
  canonical,
  worksUrl,
  worksCount,
  parents,
  children,
  synonyms,
  merger,
}: Props) {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <AppShellHeader />

      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main className="flex flex-col gap-5">
          <header className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <h2 className="min-w-0 break-words font-bold text-2xl leading-tight">{name}</h2>
              <div className="flex shrink-0 flex-wrap gap-1 sm:justify-end">
                {type && <Badge variant="secondary">{type}</Badge>}
                <Badge variant="outline">{canonical ? "Canonical" : "Not canonical"}</Badge>
              </div>
            </div>
            {merger && (
              <p className="text-muted-foreground text-sm">
                Synonym of{" "}
                {merger.url ? (
                  <a href={merger.url} className="text-link hover:underline">
                    {merger.name}
                  </a>
                ) : (
                  merger.name
                )}
                . Works tagged with {name} appear in its filter.
              </p>
            )}
          </header>

          {worksUrl && (
            <Card className="flex flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm tabular-nums">
                {n(worksCount)} {worksCount === 1 ? "work" : "works"} tagged with {name}
              </p>
              <a href={worksUrl} className={buttonVariants({ variant: "default", size: "lg" })}>
                View {n(worksCount)} works →
              </a>
            </Card>
          )}

          {parents.length > 0 && (
            <Card className="flex flex-col gap-2 px-5">
              <h3 className="font-semibold text-base">Parent tags (more general)</h3>
              <TagPills tags={parents} />
            </Card>
          )}

          {synonyms.length > 0 && (
            <Card className="flex flex-col gap-2 px-5">
              <h3 className="font-semibold text-base">Synonyms</h3>
              <TagPills tags={synonyms} />
            </Card>
          )}

          {children.length > 0 && (
            <Card className="flex flex-col gap-2 px-5">
              <h3 className="font-semibold text-base">Sub tags (more specific)</h3>
              <TagPills tags={children} />
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
