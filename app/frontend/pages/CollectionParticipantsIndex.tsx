import AppShell from "../components/AppShell";
import { Badge } from "@/design-system/components/ui/badge";
type P = { id: number; name: string; url: string | null; role: string };
type Props = { context: { heading: string; collectionName: string | null }; participants: P[] };
export default function CollectionParticipantsIndex({ context, participants }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="mb-1 font-semibold text-lg">{context.heading}</h2>
        {context.collectionName && <p className="mb-4 text-muted-foreground text-sm">{context.collectionName}</p>}
        {participants.length === 0 && <p className="py-6 text-muted-foreground">No participants.</p>}
        <div className="flex flex-col divide-y divide-border">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-3">
              <a href={p.url ?? "#"} className="font-medium text-link hover:underline">{p.name}</a>
              <Badge variant="outline">{p.role}</Badge>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
