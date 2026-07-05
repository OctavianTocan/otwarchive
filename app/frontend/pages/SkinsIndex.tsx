import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";

type Status = { label: string; kind: "approved" | "declined" | "unread" };
type Skin = {
  id: number;
  title: string;
  url: string | null;
  byline: string | null;
  authorUrl: string | null;
  descriptionHtml: string | null;
  iconUrl: string | null;
  iconAlt: string | null;
  createdAt: string | null;
  status: Status | null;
};
type Props = {
  context: {
    heading: string;
    isWorkSkin: boolean;
    isOwner: boolean;
    emptyText: string;
  };
  skins: Skin[];
};

function StatusBadge({ status }: { status: Status }) {
  const variant = status.kind === "approved" ? "outline" : status.kind === "declined" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status.label}</Badge>;
}

function SkinCard({ s, isOwner }: { s: Skin; isOwner: boolean }) {
  return (
    <Card className="px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words font-semibold text-base leading-snug">
          {s.url
            ? <a href={s.url} className="text-link hover:underline">{s.title}</a>
            : <span>{s.title}</span>}
          {s.byline && (
            <span className="ml-1.5 font-normal text-muted-foreground text-sm">
              by{" "}
              {s.authorUrl
                ? <a href={s.authorUrl} className="text-link hover:underline">{s.byline}</a>
                : <span>{s.byline}</span>}
            </span>
          )}
        </h4>
        {isOwner && s.status && (
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            <StatusBadge status={s.status} />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {s.iconUrl && (
          <a href={s.url ?? undefined} className="shrink-0">
            <img
              src={s.iconUrl}
              alt={s.iconAlt ?? ""}
              className="h-[100px] w-[100px] rounded border border-border object-cover"
            />
          </a>
        )}
        <div className="min-w-0 flex-1">
          {s.descriptionHtml
            ? (
              <blockquote
                className="border-border border-l-2 pl-3 text-foreground/90 text-sm [&_p]:my-1"
                dangerouslySetInnerHTML={{ __html: s.descriptionHtml }}
              />
            )
            : <p className="text-muted-foreground text-sm italic">(No Description Provided)</p>}
        </div>
      </div>

      {s.createdAt && (
        <p className="border-border border-t border-dashed pt-3 text-muted-foreground text-xs tabular-nums">
          {s.createdAt}
        </p>
      )}
    </Card>
  );
}

export default function SkinsIndex({ context, skins }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 md:px-5 pt-6 pb-16">
        <main>
          <h2 className="font-bold text-2xl">{context.heading || "Skins"}</h2>
          <p className="mt-1 mb-4 max-w-[70ch] text-muted-foreground text-sm">
            A site skin lets you change the way the Archive is presented when you are logged in
            to your account. You can use work skins to customize the way your own works are shown
            to others.
          </p>

          <nav className="mb-5 flex flex-wrap gap-3 text-sm">
            <a
              href="/skins?skin_type=Site"
              className={context.isWorkSkin ? "text-link hover:underline" : "font-semibold"}
            >
              Public Site Skins
            </a>
            <a
              href="/skins?skin_type=WorkSkin"
              className={context.isWorkSkin ? "font-semibold" : "text-link hover:underline"}
            >
              Public Work Skins
            </a>
          </nav>

          {skins.length === 0
            ? <p className="py-6 text-muted-foreground">{context.emptyText}</p>
            : (
              <ol className="grid overflow-hidden rounded-lg border border-border bg-card">
                {skins.map((s) => <li key={s.id}><SkinCard s={s} isOwner={context.isOwner} /></li>)}
              </ol>
            )}
        </main>
      </div>
    </AppShell>
  );
}
