import type { ReactNode } from "react";
import { cn } from "@/design-system/lib/utils";

type SectionHeaderProps = {
  readonly title: ReactNode;
  readonly action?: ReactNode;
  readonly variant?: "page" | "section" | "compact";
  readonly className?: string;
};

export function SectionHeader({
  title,
  action,
  variant = "section",
  className,
}: SectionHeaderProps) {
  const headingClassName = cn(
    variant === "section" ? "font-bold text-lg" : "font-semibold text-base",
    variant === "compact" && "text-muted-foreground text-sm uppercase tracking-wide",
  );

  const heading = variant === "section" ? (
    <h3 className={headingClassName}>{title}</h3>
  ) : (
    <h2 className={headingClassName}>{title}</h2>
  );

  if (!action) {
    return <div className={cn("mb-3", className)}>{heading}</div>;
  }

  return (
    <div className={cn("mb-3 flex items-baseline justify-between gap-3", className)}>
      {heading}
      {action}
    </div>
  );
}
