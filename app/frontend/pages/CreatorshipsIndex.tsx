import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";

type Creatorship = {
  id: number;
  workTitle: string | null;
  workUrl: string | null;
  type: string;
  approved: boolean;
};
type Props = {
  context: { heading: string };
  creatorships: Creatorship[];
};

function CreatorshipRow({ c }: { c: Creatorship }) {
  return (
    <Card className="flex flex-col gap-2 rounded-none border-x-0 border-t-0 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h4 className="break-words font-semibold text-[15px] leading-snug">
          {c.workUrl ? (
            <a href={c.workUrl} className="text-link hover:underline">{c.workTitle}</a>
          ) : (
            c.workTitle
          )}
        </h4>
        <p className="mt-0.5 text-muted-foreground text-sm">{c.type}</p>
      </div>
      <Badge variant={c.approved ? "outline" : "secondary"} className="shrink-0 self-start sm:self-auto">
        {c.approved ? "Approved" : "Pending"}
      </Badge>
    </Card>
  );
}

export default function CreatorshipsIndex({ context, creatorships }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <main>
          <h2 className="font-semibold text-base">{context.heading}</h2>

          <p className="mt-0.5 mb-4 text-muted-foreground text-sm">
            Accepting or rejecting co-creator requests inline is coming in a follow-up. For now, use the classic view to respond.
          </p>

          {creatorships.length === 0 ? (
            <p className="py-6 text-muted-foreground">No co-creator requests found.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {creatorships.map((c) => (
                <li key={c.id}><CreatorshipRow c={c} /></li>
              ))}
            </ol>
          )}
        </main>
      </div>
    </AppShell>
  );
}
