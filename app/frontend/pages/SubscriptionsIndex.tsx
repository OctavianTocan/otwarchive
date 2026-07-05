import { router } from "@inertiajs/react";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type Subscription = { type: string; name: string; url: string | null };
type Props = {
  context: { heading: string };
  subscriptions: Subscription[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function SubscriptionCard({ s }: { s: Subscription }) {
  return (
    <Card className="flex flex-col gap-2 px-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <h4 className="min-w-0 break-words font-semibold text-base leading-snug">
        {s.url ? (
          <a href={s.url} className="text-link hover:underline">{s.name}</a>
        ) : (
          s.name
        )}
      </h4>
      <Badge variant="outline" className="shrink-0 self-start sm:self-auto">{s.type}</Badge>
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

export default function SubscriptionsIndex({ context, subscriptions, pagination }: Props) {
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
            {n(pagination.count)} subscriptions · page {pagination.page} of {pagination.pages}
          </p>

          <p className="mb-4 text-muted-foreground text-sm">
            To unsubscribe, open a subscription and use the unsubscribe action there. Managing subscriptions inline is coming in a follow-up.
          </p>

          {subscriptions.length === 0 && <p className="py-6 text-muted-foreground">You are not subscribed to anything yet.</p>}

          <ol className="grid gap-3.5">
            {subscriptions.map((s, i) => (
              <li key={i}><SubscriptionCard s={s} /></li>
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
