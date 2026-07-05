import { router } from "@inertiajs/react";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type InboxComment = {
  commenter: string | null;
  commenterUrl: string | null;
  anonymous?: boolean;
  contentHtml: string | null;
  created: string | null;
  read: boolean;
  replied?: boolean;
  unreviewed?: boolean;
  subjectTitle: string | null;
  subjectUrl: string | null;
};

type Props = {
  context: { heading: string };
  comments: InboxComment[];
  pagination: { page: number; pages: number; count: number };
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function CommentCard({ c }: { c: InboxComment }) {
  return (
    <Card className="flex flex-col gap-2.5 px-5 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h4 className="min-w-0 break-words font-semibold text-base leading-snug">
          {c.commenterUrl && c.commenter ? (
            <a href={c.commenterUrl} className="text-link hover:underline">{c.commenter}</a>
          ) : (
            <span>{c.commenter ?? "Unknown"}</span>
          )}
          <span className="font-normal text-muted-foreground"> on </span>
          {c.subjectUrl && c.subjectTitle ? (
            <a href={c.subjectUrl} className="text-link hover:underline">{c.subjectTitle}</a>
          ) : (
            <span>{c.subjectTitle ?? "Deleted Object"}</span>
          )}
        </h4>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {!c.read && <Badge variant="default" className="shrink-0">Unread</Badge>}
          {c.replied && <Badge variant="outline" className="shrink-0">Replied</Badge>}
          {c.unreviewed && <Badge variant="secondary" className="shrink-0">Unreviewed</Badge>}
        </div>
      </div>

      {c.contentHtml && (
        <blockquote
          className="userstuff border-border border-l-2 pl-3 text-sm [&_p]:my-1"
          dangerouslySetInnerHTML={{ __html: c.contentHtml }}
        />
      )}

      {c.created && (
        <p className="text-muted-foreground text-xs tabular-nums">{formatDate(c.created)}</p>
      )}
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

export default function Inbox({ context, comments, pagination }: Props) {
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
            {n(pagination.count)} comments · page {pagination.page} of {pagination.pages}
          </p>

          <p className="mb-4 text-muted-foreground text-sm">
            Marking comments read/unread, deleting, replying, and approving are coming in a follow-up.
          </p>

          {comments.length === 0 && <p className="py-6 text-muted-foreground">Your inbox is empty.</p>}

          <ol className="grid gap-3.5">
            {comments.map((c, i) => (
              <li key={i}><CommentCard c={c} /></li>
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
