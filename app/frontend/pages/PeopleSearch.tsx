import { router } from "@inertiajs/react";
import AppShell from "../components/AppShell";
import { useState } from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";

type TagRef = { name: string; url: string | null; type: string };
type Person = {
  name: string;
  url: string | null;
  userLogin: string | null;
  workCount: number;
  fandoms: TagRef[];
};
type Props = {
  context: { heading: string; query: string | null };
  people: Person[];
  pagination: { page: number; pages: number; count: number };
  resultCount: number;
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function buildUrl(name: string, page: number) {
  const p = new URLSearchParams();
  if (name) p.set("people_search[name]", name);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
}

function PersonBlurb({ p }: { p: Person }) {
  const showLogin = p.userLogin && p.userLogin !== p.name;
  return (
    <Card className="px-5 transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h4 className="min-w-0 break-words font-semibold text-base leading-snug">
          <a href={p.url ?? "#"} className="text-link hover:underline">{p.name}</a>
          {showLogin && (
            <span className="font-normal text-muted-foreground">
              {" "}(<a href={p.userLogin ? `/users/${p.userLogin}` : "#"} className="text-link hover:underline">{p.userLogin}</a>)
            </span>
          )}
        </h4>
        {p.workCount > 0 && (
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            <Badge variant="outline" render={<a href={p.url ? `${p.url}/works` : "#"} />}>
              {n(p.workCount)} {p.workCount === 1 ? "work" : "works"}
            </Badge>
          </div>
        )}
      </div>

      {p.fandoms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.fandoms.map((f, i) => (
            <Badge key={i} variant="secondary" render={<a href={f.url ?? "#"} />}>{f.name}</Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function PeopleSearch({ context, people, pagination, resultCount }: Props) {
  const [name, setName] = useState<string>(context.query ?? "");
  const [busy, setBusy] = useState(false);

  const go = (page = 1, q = name) => {
    setBusy(true);
    router.get(buildUrl(q, page), {}, { preserveScroll: true, preserveState: false, onFinish: () => setBusy(false) });
  };

  const inputCls = "w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/40";

  return (
    <AppShell>
      <div className="mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="font-bold text-2xl">{context.heading || "People Search"}</h2>

        <Card className="mt-4 px-5">
          <label htmlFor="people_search_name" className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Search people
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="people_search_name"
              type="text"
              placeholder="Pseud or username…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go(1)}
              className={inputCls}
            />
            <Button variant="default" size="sm" onClick={() => go(1)} disabled={busy}>
              {busy ? "Searching…" : "Search"}
            </Button>
          </div>
          {context.query && (
            <p className="text-muted-foreground text-sm">You searched for: <span className="text-foreground">{context.query}</span></p>
          )}
        </Card>

        {context.query != null && (
          <p className="mt-5 mb-4 text-muted-foreground tabular-nums">
            {n(resultCount)} {resultCount === 1 ? "person found" : "people found"}
            {pagination.pages > 1 && <> · page {pagination.page} of {pagination.pages}</>}
          </p>
        )}

        {context.query == null ? null : people.length === 0 ? (
          <p className="py-6 text-muted-foreground">No results found. You may want to edit your search to make it less specific.</p>
        ) : (
          <ol className="grid gap-3.5">{people.map((p, i) => <li key={`${p.userLogin}-${p.name}-${i}`}><PersonBlurb p={p} /></li>)}</ol>
        )}

        {pagination.pages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1 || busy} onClick={() => go(pagination.page - 1)}>← Prev</Button>
            <span className="tabular-nums">Page {pagination.page} / {pagination.pages}</span>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages || busy} onClick={() => go(pagination.page + 1)}>Next →</Button>
          </nav>
        )}
      </div>
    </AppShell>
  );
}
