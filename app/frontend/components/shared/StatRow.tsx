import { cn } from "@/design-system/lib/utils";
import type { StatItem } from "./archiveTypes";

type StatRowProps = {
  readonly items: readonly StatItem[];
  readonly separated?: boolean;
  readonly className?: string;
};

export function StatRow({ items, separated = true, className }: StatRowProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground text-xs tabular-nums",
        separated && "border-border border-t border-dashed pt-3",
        className,
      )}
    >
      {visibleItems.map((item) => (
        <span key={item.label}>
          <dt className="inline font-semibold">{item.label}:</dt>{" "}
          <dd className="inline">{item.value}</dd>
        </span>
      ))}
    </dl>
  );
}
