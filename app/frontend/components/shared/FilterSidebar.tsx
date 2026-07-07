import type { ReactNode } from "react";
import { Card } from "@/design-system/components/ui/card";
import { cn } from "@/design-system/lib/utils";

type FilterSidebarProps = {
  readonly children: ReactNode;
  readonly footer: ReactNode;
  readonly busy?: boolean;
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly title?: string;
};

type FilterSectionProps = {
  readonly title: string;
  readonly children: ReactNode;
};

export function FilterSidebar({
  children,
  footer,
  busy = false,
  open,
  onToggle,
  title = "Sort & Filter",
}: FilterSidebarProps) {
  return (
    <aside className="self-start md:sticky md:top-4">
      <Card className="max-h-[calc(100svh-2rem)] gap-0 overflow-auto px-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-2 pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide md:pointer-events-none"
          aria-expanded={open}
        >
          {title} {busy && <span className="text-link">…</span>}
          <span className="ml-auto text-sm normal-case md:hidden">{open ? "Hide" : "Show"}</span>
        </button>

        <div className={cn(open ? "block" : "hidden", "md:block")}>
          {children}
          <div className="sticky bottom-0 mt-3 flex gap-2 bg-card pt-2.5">{footer}</div>
        </div>
      </Card>
    </aside>
  );
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className="border-border border-t py-2.5">
      <h3 className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </section>
  );
}
