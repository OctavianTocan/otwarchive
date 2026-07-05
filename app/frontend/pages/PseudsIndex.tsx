import { router } from "@inertiajs/react";
import AppShell from "../components/AppShell";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type Pseud = {
  name: string; url: string | null; userName: string; userUrl: string | null; showUser: boolean;
  iconUrl: string | null; descriptionHtml: string | null;
  workCount: number; recCount: number; isDefault: boolean;
  canEdit: boolean; canDelete: boolean; canOrphan: boolean;
  editUrl: string | null; deleteUrl: string | null; orphanUrl: string | null;
};
type Props = {
  context: { heading: string; userLogin: string; isOwner: boolean; newPseudUrl: string | null };
  pseuds: Pseud[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v: number) => v.toLocaleString("en-US");

function PseudCard({ p, userLogin }: { p: Pseud; userLogin: string }) {
  const del = () => {
    if (!p.deleteUrl) return;
    if (confirm(`Delete pseud "${p.name}"? This cannot be undone.`)) router.delete(p.deleteUrl);
  };
  return (
    <li className="flex gap-4 py-5">
      <div className="size-14 shrink-0 overflow-hidden rounded-full bg-muted">
        {p.iconUrl ? (
          <img src={p.iconUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center font-semibold text-muted-foreground text-lg">{p.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h4 className="font-semibold text-[15px]">
            <a href={p.url ?? "#"} className="text-link hover:underline">{p.name}</a>
          </h4>
          {p.showUser && p.userName !== p.name && (
            <a href={p.userUrl ?? "#"} className="text-muted-foreground text-sm hover:underline">({p.userName})</a>
          )}
          {p.isDefault && <Badge variant="outline">Default</Badge>}
        </div>
        <p className="mt-0.5 text-muted-foreground text-sm tabular-nums">
          {n(p.workCount)} {p.workCount === 1 ? "work" : "works"} · {n(p.recCount)} {p.recCount === 1 ? "rec" : "recs"}
        </p>
        {p.descriptionHtml && <div className="mt-2 text-foreground/90 text-sm [&_p]:my-1" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />}
        {p.canEdit && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" render={<a href={p.editUrl ?? "#"} />}>Edit</Button>
            {p.canOrphan && <Button variant="outline" size="sm" render={<a href={p.orphanUrl ?? "#"} />}>Orphan works</Button>}
            {p.canDelete && <Button variant="outline" size="sm" onClick={del} className="text-destructive hover:text-destructive">Delete</Button>}
          </div>
        )}
      </div>
    </li>
  );
}

export default function PseudsIndex({ context, pseuds, pagination }: Props) {
  const go = (page: number) => router.get(`?page=${page}`, {}, { preserveScroll: true });
  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-base">Pseuds for {context.userLogin}</h2>
          {context.isOwner && context.newPseudUrl && (
            <Button variant="default" size="sm" render={<a href={context.newPseudUrl} />}>New pseud</Button>
          )}
        </div>
        <p className="mt-0.5 mb-2 text-muted-foreground text-sm tabular-nums">{n(pagination.count)} {pagination.count === 1 ? "pseud" : "pseuds"}</p>

        <ul className="flex flex-col divide-y divide-border">
          {pseuds.map((p, i) => <PseudCard key={i} p={p} userLogin={context.userLogin} />)}
        </ul>

        {pagination.pages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => go(pagination.page - 1)}>← Prev</Button>
            <span className="tabular-nums">Page {pagination.page} / {pagination.pages}</span>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => go(pagination.page + 1)}>Next →</Button>
          </nav>
        )}
      </div>
    </AppShell>
  );
}
