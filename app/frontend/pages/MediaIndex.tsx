import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";

type Medium = {
  name: string;
  url: string | null;
  fandomsUrl: string | null;
};
type Props = {
  context: { heading: string };
  media: Medium[];
};

function MediumCard({ m }: { m: Medium }) {
  const href = m.fandomsUrl ?? m.url ?? undefined;
  return (
    <Card className="flex items-center justify-between gap-3 px-5 py-4 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <h3 className="min-w-0 break-words font-semibold text-base leading-snug">
        {href
          ? <a href={href} className="text-link hover:underline">{m.name}</a>
          : <span>{m.name}</span>}
      </h3>
      <Badge variant="outline" className="shrink-0">Fandoms →</Badge>
    </Card>
  );
}

export default function MediaIndex({ context, media }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main>
          <h2 className="font-bold text-2xl">{context.heading || "Fandoms"}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground">
            Browse fandoms by media category.
          </p>
          {media.length === 0 && (
            <p className="py-6 text-muted-foreground">Sorry, there were no media categories found.</p>
          )}
          <ol className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((m) => (
              <li key={m.name}><MediumCard m={m} /></li>
            ))}
          </ol>
        </main>
      </div>
    </AppShell>
  );
}
