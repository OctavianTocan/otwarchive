import AppShell from "../components/AppShell";

type Tag = { name: string; url: string | null; size: number };
type Props = {
  context: {
    heading: string; show: "popular" | "random"; loggedIn: boolean;
    popularUrl: string; randomUrl: string; searchUrl: string; tagSetsUrl: string;
  };
  tags: Tag[];
};

// size bucket 1..8 → text size + weight, smallest to largest
const SIZE_CLS = [
  "text-xs text-foreground/60",
  "text-sm text-foreground/70",
  "text-sm text-foreground/80",
  "text-base",
  "text-lg",
  "text-xl font-medium",
  "text-2xl font-semibold",
  "text-3xl font-semibold",
];

export default function TagsIndex({ context, tags }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="font-semibold text-base">Tags</h2>

        <nav className="mt-2 mb-5 flex flex-wrap items-center gap-1.5 border-border border-b pb-3 text-sm">
          {context.loggedIn && (
            <a href={context.tagSetsUrl} className="rounded-md px-2.5 py-1 text-foreground/70 hover:bg-muted hover:text-foreground hover:no-underline">Tag Sets</a>
          )}
          <a href={context.popularUrl}
            className={`rounded-md px-2.5 py-1 hover:no-underline ${context.show === "popular" ? "bg-accent font-medium text-accent-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}>
            Most Popular
          </a>
          <a href={context.randomUrl}
            className={`rounded-md px-2.5 py-1 hover:no-underline ${context.show === "random" ? "bg-accent font-medium text-accent-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}>
            Random
          </a>
          <a href={context.searchUrl} className="ml-auto rounded-md px-2.5 py-1 text-link hover:bg-muted hover:no-underline">Search tags →</a>
        </nav>

        <p className="mb-4 text-muted-foreground text-sm">
          {context.show === "random"
            ? "A random selection of additional tags. Reload for a different set, or search tags to find something specific."
            : "The most popular additional tags, sized by how many works use them."}
        </p>

        {tags.length === 0 ? (
          <p className="py-6 text-muted-foreground">No tags found.</p>
        ) : (
          <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2 leading-tight">
            {tags.map((t, i) => (
              <li key={i}>
                <a href={t.url ?? "#"} className={`text-link hover:underline ${SIZE_CLS[Math.min(Math.max(t.size - 1, 0), 7)]}`}>{t.name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
