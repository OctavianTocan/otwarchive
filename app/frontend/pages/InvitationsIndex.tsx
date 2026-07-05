import { router } from "@inertiajs/react";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type InvitedUser = { name: string | null; url: string | null };
type Invitation = {
  token: string;
  email: string | null;
  used: boolean;
  invitedUser: InvitedUser | null;
  created: string | null;
};
type Props = {
  context: { heading: string };
  invitations: Invitation[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function InvitedUserLabel({ user }: { user: InvitedUser }) {
  if (user.name && user.url) {
    return <a href={user.url} className="text-link hover:underline">{user.name}</a>;
  }
  if (user.name) return <span>{user.name}</span>;
  return <span className="text-muted-foreground">deleted user</span>;
}

function InvitationRow({ i }: { i: Invitation }) {
  return (
    <Card className="flex flex-col gap-2 px-5 rounded-none border-x-0 border-t-0 py-5 transition-colors last:border-b-0 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h4 className="min-w-0 break-all font-semibold text-base leading-snug tabular-nums">{i.token}</h4>
        <p className="mt-0.5 text-muted-foreground text-sm">
          {i.used ? (
            <>Redeemed by <InvitedUserLabel user={i.invitedUser ?? { name: null, url: null }} /></>
          ) : i.email ? (
            <>Sent to {i.email}, not yet redeemed</>
          ) : (
            <>Unsent</>
          )}
          {i.created && <span className="tabular-nums"> · created {i.created}</span>}
        </p>
      </div>
      <Badge variant={i.used ? "outline" : "secondary"} className="shrink-0 self-start sm:self-auto">
        {i.used ? "Used" : i.email ? "Sent" : "Unsent"}
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

export default function InvitationsIndex({ context, invitations, pagination }: Props) {
  const [busy, setBusy] = useState(false);

  const go = (page: number) => {
    setBusy(true);
    router.get(buildUrl(page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <main>
          <h2 className="font-bold text-2xl">{context.heading}</h2>
          <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">
            {n(pagination.count)} invitations · page {pagination.page} of {pagination.pages}
          </p>

          <p className="mb-4 text-muted-foreground text-sm">
            Sending a new invitation to a friend and managing individual invitations is coming in a follow-up. For now this page lists your invitations and their status.
          </p>

          {invitations.length === 0 && (
            <p className="py-6 text-muted-foreground">You have no invitations right now.</p>
          )}

          <ol className="flex flex-col divide-y divide-border">
            {invitations.map((i) => (
              <li key={i.token}><InvitationRow i={i} /></li>
            ))}
          </ol>

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
