import { Link } from "@inertiajs/react";
import type { MouseEvent, ReactNode } from "react";
import { Button } from "@/design-system/components/ui/button";
import type { Pagination } from "./archiveTypes";

type PaginationBarProps = {
  readonly pagination: Pagination;
  readonly busy?: boolean;
  readonly onPage: (page: number) => void;
  readonly hrefForPage?: (page: number) => string;
};

type PageButtonProps = {
  readonly children: ReactNode;
  readonly disabled: boolean;
  readonly href: string | undefined;
  readonly onPage: () => void;
};

function PageButton({ children, disabled, href, onPage }: PageButtonProps) {
  if (href && !disabled) {
    return (
      <Button
        render={(
          <Link
            cacheFor="30s"
            href={href}
            onClick={(event: MouseEvent) => {
              event.preventDefault();
              onPage();
            }}
            prefetch="hover"
            preserveScroll
          />
        )}
        size="sm"
        variant="outline"
      >
        {children}
      </Button>
    );
  }

  return (
    <Button disabled={disabled} onClick={onPage} size="sm" variant="outline">
      {children}
    </Button>
  );
}

export function PaginationBar({ pagination, busy = false, onPage, hrefForPage }: PaginationBarProps) {
  if (pagination.pages <= 1) {
    return null;
  }

  const previousPage = pagination.page - 1;
  const nextPage = pagination.page + 1;

  return (
    <nav className="mt-6 flex items-center justify-center gap-4 text-muted-foreground" aria-label="Pagination">
      <PageButton
        disabled={pagination.page <= 1 || busy}
        href={hrefForPage?.(previousPage)}
        onPage={() => onPage(previousPage)}
      >
        Previous
      </PageButton>
      <span className="tabular-nums">
        Page {pagination.page} / {pagination.pages}
      </span>
      <PageButton
        disabled={pagination.page >= pagination.pages || busy}
        href={hrefForPage?.(nextPage)}
        onPage={() => onPage(nextPage)}
      >
        Next
      </PageButton>
    </nav>
  );
}
