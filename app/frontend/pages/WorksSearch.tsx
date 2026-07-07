import { router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";
import { Card } from "@/design-system/components/ui/card";
import {
  PageFrame,
  PaginationBar,
  SectionHeader,
  WorkBlurbCard,
  formatCount,
  type Pagination,
  type WorkBlurb,
} from "../components/shared";

type Props = {
  readonly context: {
    readonly heading: string;
    readonly query: string | null;
    readonly summary: string | null;
  };
  readonly works: readonly WorkBlurb[];
  readonly pagination: Pagination;
  readonly resultCount: number;
  readonly filters: { readonly work_search: { readonly query?: string } };
};

const inputClassName =
  "w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/40";

function buildUrl(query: string, page: number) {
  const params = new URLSearchParams();
  if (query) {
    params.set("work_search[query]", query);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  return `${window.location.pathname}?${params.toString()}`;
}

export default function WorksSearch({ context, works, pagination, resultCount, filters }: Props) {
  const [query, setQuery] = useState<string>(filters.work_search?.query ?? "");
  const [busy, setBusy] = useState(false);
  const searched = (context.query ?? "").length > 0 || resultCount > 0;

  const go = (page = 1, nextQuery = query) => {
    setBusy(true);
    router.get(buildUrl(nextQuery, page), {}, {
      only: ["works", "pagination", "resultCount", "filters", "context"],
      preserveScroll: true,
      preserveState: true,
      replace: true,
      onFinish: () => setBusy(false),
    });
  };

  return (
    <PageFrame variant="narrow">
      <SectionHeader title={context.heading || "Search Works"} variant="page" />

      <Card className="mt-4 px-5">
        <label htmlFor="work_search_query" className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Search all works
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="work_search_query"
            type="text"
            placeholder="Any field: title, author, tags, summary…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && go(1)}
            className={inputClassName}
          />
          <Button variant="default" size="sm" onClick={() => go(1)} disabled={busy}>
            {busy ? "Searching…" : "Search"}
          </Button>
        </div>
        {context.summary && (
          <p className="text-muted-foreground text-sm">
            You searched for: <span className="text-foreground">{context.summary}</span>
          </p>
        )}
      </Card>

      {searched && (
        <p className="mt-5 mb-4 text-muted-foreground tabular-nums">
          {formatCount(resultCount)} {resultCount === 1 ? "work found" : "works found"}
          {pagination.pages > 1 && <> · page {pagination.page} of {pagination.pages}</>}
        </p>
      )}

      {searched && (works.length === 0 ? (
        <p className="py-6 text-muted-foreground">No results found. You may want to edit your search to make it less specific.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-border">
          {works.map((work) => (
            <li key={work.id}>
              <WorkBlurbCard work={work} />
            </li>
          ))}
        </ol>
      ))}

      <PaginationBar
        busy={busy}
        hrefForPage={(page) => buildUrl(query, page)}
        onPage={go}
        pagination={pagination}
      />
    </PageFrame>
  );
}
