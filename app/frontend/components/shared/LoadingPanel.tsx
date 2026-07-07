import { cn } from "@/design-system/lib/utils";

const spinnerCells = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

type LoadingPanelProps = {
  readonly label: string;
  readonly surface?: "panel" | "screen" | "overlay";
};

function AgentSpinner({ label }: { readonly label: string }) {
  return (
    <span aria-label={label} className="ao3-agent-spinner" role="status">
      {spinnerCells.map((cell) => (
        <span key={cell} aria-hidden="true" />
      ))}
    </span>
  );
}

export function LoadingPanel({ label, surface = "panel" }: LoadingPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        surface === "screen" && "min-h-[100dvh] bg-background",
        surface === "panel" && "min-h-64 rounded-xl border border-border bg-card shadow-sm",
        surface === "overlay" && "rounded-xl border border-border bg-card/95 px-5 py-4 shadow-md backdrop-blur-sm",
      )}
    >
      <AgentSpinner label={label} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
