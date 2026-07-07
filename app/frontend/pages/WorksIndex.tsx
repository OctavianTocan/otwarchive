import { router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";
import WorkSheet from "../components/WorkSheet";
import {
  FilterSection,
  FilterSidebar,
  PageFrame,
  PaginationBar,
  SectionHeader,
  WorkBlurbCard,
  formatCount,
  type FacetGroup,
  type Pagination,
  type WorkBlurb,
} from "../components/shared";

type Filters = {
  readonly include: Record<string, string[]>;
  readonly work_search: Record<string, string>;
  readonly page: number;
};

type Props = {
  readonly context: {
    readonly heading: string;
    readonly ownerName: string | null;
    readonly tagId: string | null;
  };
  readonly works: readonly WorkBlurb[];
  readonly pagination: Pagination;
  readonly facets: readonly FacetGroup[];
  readonly filters: Filters;
};

const SORTS = [
  ["_score", "Best Match"],
  ["authors_to_sort_on", "Author"],
  ["title_to_sort_on", "Title"],
  ["created_at", "Date Posted"],
  ["revised_at", "Date Updated"],
  ["word_count", "Word Count"],
  ["hits", "Hits"],
  ["kudos_count", "Kudos"],
  ["comments_count", "Comments"],
  ["bookmarks_count", "Bookmarks"],
] as const;

const COMPLETION_STATUSES = [
  ["", "All works"],
  ["T", "Complete only"],
  ["F", "Works in progress"],
] as const;

const inputClassName =
  "w-full rounded-md border border-border bg-input px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/40";

function buildUrl(
  include: Record<string, string[]>,
  workSearch: Record<string, string>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, ids] of Object.entries(include)) {
    for (const id of ids) {
      params.append(`include_work_search[${key}_ids][]`, id);
    }
  }
  for (const [key, value] of Object.entries(workSearch)) {
    if (value) {
      params.append(`work_search[${key}]`, value);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  return `${window.location.pathname}?${params.toString()}`;
}

export default function WorksIndex({ context, works, pagination, facets, filters }: Props) {
  const [include, setInclude] = useState<Record<string, string[]>>(filters.include ?? {});
  const [workSearch, setWorkSearch] = useState<Record<string, string>>(filters.work_search ?? {});
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState<{ readonly id: number; readonly url: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const go = (page = 1, nextInclude = include, nextWorkSearch = workSearch) => {
    setBusy(true);
    router.get(buildUrl(nextInclude, nextWorkSearch, page), {}, {
      only: ["works", "pagination", "facets", "filters", "context"],
      preserveScroll: true,
      preserveState: true,
      replace: true,
      onFinish: () => setBusy(false),
    });
  };

  const toggle = (key: string, id: string) => {
    const current = include[key] ?? [];
    setInclude({
      ...include,
      [key]: current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    });
  };

  const setScalar = (key: string, value: string) => {
    setWorkSearch((state) => ({ ...state, [key]: value }));
  };

  const clear = () => {
    setInclude({});
    setWorkSearch({});
    go(1, {}, {});
  };

  return (
    <PageFrame
      variant="withSidebar"
      after={(
        <WorkSheet
          workId={sheet?.id ?? null}
          workUrl={sheet?.url ?? null}
          onClose={() => setSheet(null)}
        />
      )}
    >
      <FilterSidebar
        busy={busy}
        open={filtersOpen}
        onToggle={() => setFiltersOpen((open) => !open)}
        footer={(
          <>
            <Button variant="default" size="sm" onClick={() => go(1)} disabled={busy}>
              Sort and Filter
            </Button>
            <Button variant="outline" size="sm" onClick={clear} disabled={busy}>
              Clear
            </Button>
          </>
        )}
      >
        <FilterSection title="Sort by">
          <select
            value={workSearch.sort_column ?? "_score"}
            onChange={(event) => setScalar("sort_column", event.target.value)}
            className={inputClassName}
          >
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FilterSection>

        <FilterSection title="Completion Status">
          <div className="grid gap-1">
            {COMPLETION_STATUSES.map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted"
              >
                <input
                  type="radio"
                  name="complete"
                  checked={(workSearch.complete ?? "") === value}
                  onChange={() => setScalar("complete", value)}
                  className="accent-primary"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Word Count">
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="number"
              placeholder="From"
              value={workSearch.words_from ?? ""}
              onChange={(event) => setScalar("words_from", event.target.value)}
              className={inputClassName}
            />
            <input
              type="number"
              placeholder="To"
              value={workSearch.words_to ?? ""}
              onChange={(event) => setScalar("words_to", event.target.value)}
              className={inputClassName}
            />
          </div>
        </FilterSection>

        <FilterSection title="Search within results">
          <input
            type="text"
            placeholder="Keywords"
            value={workSearch.query ?? ""}
            onChange={(event) => setScalar("query", event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && go(1)}
            className={inputClassName}
          />
        </FilterSection>

        {facets.map((group) => (
          <FilterSection key={group.key} title={group.label}>
            <ul className="grid gap-0.5">
              {group.items.slice(0, 15).map((item) => (
                <li key={item.value}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={(include[group.key] ?? []).includes(item.value)}
                      onChange={() => toggle(group.key, item.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{item.label}</span>
                    <em className="ml-auto text-muted-foreground text-xs not-italic tabular-nums">
                      ({formatCount(item.count)})
                    </em>
                  </label>
                </li>
              ))}
            </ul>
          </FilterSection>
        ))}
      </FilterSidebar>

      <section>
        <SectionHeader title={context.heading || context.ownerName} variant="page" />
        <p className="mt-0.5 mb-4 text-muted-foreground tabular-nums">
          {formatCount(pagination.count)} works · page {pagination.page} of {pagination.pages}
        </p>
        {works.length === 0 && <p className="py-6 text-muted-foreground">No works matched these filters.</p>}
        <ol className="flex flex-col divide-y divide-border">
          {works.map((work) => (
            <li key={work.id}>
              <WorkBlurbCard
                work={work}
                onOpen={(selectedWork) => setSheet({ id: selectedWork.id, url: selectedWork.url })}
              />
            </li>
          ))}
        </ol>
        <PaginationBar
          busy={busy}
          hrefForPage={(page) => buildUrl(include, workSearch, page)}
          onPage={go}
          pagination={pagination}
        />
      </section>
    </PageFrame>
  );
}
