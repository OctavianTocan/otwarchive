import { router } from "@inertiajs/react";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type TagStatus = "approved" | "rejected" | "pending";
type TagRef = { name: string; type: string; status: TagStatus };
type NominatorRef = { name: string; url: string | null };
type SubmissionStatus = "reviewed" | "partial" | "pending";
type Nomination = {
  id: number;
  nominator: NominatorRef | null;
  tags: TagRef[];
  status: SubmissionStatus;
  url: string | null;
};
type Props = {
  context: { heading: string; tagSetTitle: string };
  nominations: Nomination[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

const SUBMISSION_LABEL: Record<SubmissionStatus, string> = {
  reviewed: "Reviewed",
  partial: "Partially reviewed",
  pending: "Pending",
};
const SUBMISSION_VARIANT: Record<SubmissionStatus, "success" | "attention" | "secondary"> = {
  reviewed: "success",
  partial: "attention",
  pending: "secondary",
};
const TAG_VARIANT: Record<TagStatus, "success" | "destructive" | "outline"> = {
  approved: "success",
  rejected: "destructive",
  pending: "outline",
};

function NominationRow({ nom }: { nom: Nomination }) {
  const name = nom.nominator?.name ?? "(deleted)";
  return (
    <Card className="flex flex-col gap-2 rounded-none border-x-0 border-t-0 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h4 className="break-words font-semibold text-[15px] leading-snug">
          {nom.url ? (
            <a href={nom.url} className="text-link hover:underline">{name}</a>
          ) : (
            name
          )}
        </h4>
        {nom.nominator?.url && (
          <p className="mt-0.5 text-muted-foreground text-sm">
            <a href={nom.nominator.url} className="text-link hover:underline">Profile</a>
          </p>
        )}
        {nom.tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {nom.tags.map((t, i) => (
              <li key={i}>
                <Badge variant={TAG_VARIANT[t.status]} title={`${t.type} · ${t.status}`}>
                  {t.name}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted-foreground text-sm">No tags nominated.</p>
        )}
      </div>
      <Badge variant={SUBMISSION_VARIANT[nom.status]} className="shrink-0 self-start">
        {SUBMISSION_LABEL[nom.status]}
      </Badge>
    </Card>
  );
}

function buildUrl(page: number) {
  const p = new URLSearchParams(window.location.search);
  if (page > 1) p.set("page", String(page));
  else p.delete("page");
  const q = p.toString();
  return q ? `${window.location.pathname}?${q}` : window.location.pathname;
}

export default function TagSetNominationsIndex({ context, nominations, pagination }: Props) {
  const [busy, setBusy] = useState(false);

  const go = (page: number) => {
    setBusy(true);
    router.get(buildUrl(page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <main>
          <h2 className="font-semibold text-base">{context.heading}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">
            {n(pagination.count)} nominations · page {pagination.page} of {pagination.pages}
          </p>

          <p className="mb-4 text-muted-foreground text-sm">
            Approving or rejecting nominations inline is coming in a follow-up. For now, open a nomination or use the classic view to review.
          </p>

          {nominations.length === 0 ? (
            <p className="py-6 text-muted-foreground">No nominations to review.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {nominations.map((nom) => (
                <li key={nom.id}><NominationRow nom={nom} /></li>
              ))}
            </ol>
          )}

          {pagination.pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1 || busy} onClick={() => go(pagination.page - 1)}>← Prev</Button>
              <span className="tabular-nums">Page {pagination.page} / {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages || busy} onClick={() => go(pagination.page + 1)}>Next →</Button>
            </nav>
          )}
        </main>
      </div>
    </AppShell>
  );
}
