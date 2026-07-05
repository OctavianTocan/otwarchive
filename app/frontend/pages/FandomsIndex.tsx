import AppShell from "../components/AppShell";

type Fandom = { name: string; url: string | null; count?: number | null };
type Letter = { letter: string; fandoms: Fandom[] };
type Props = {
  context: { heading: string; mediumName: string | null; mediaUrl: string };
  letters: Letter[];
};

const n = (v?: number | null) => (v == null ? null : v.toLocaleString("en-US"));

export default function FandomsIndex({ context, letters }: Props) {
  const empty = letters.every((l) => l.fandoms.length === 0);
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="font-semibold text-base">
          <a href={context.mediaUrl} className="text-link hover:underline">Fandoms</a>
          {context.mediumName && <span className="text-muted-foreground"> › {context.mediumName}</span>}
        </h2>
        <p className="mt-0.5 mb-4 text-muted-foreground text-sm">
          Tip: press <kbd className="rounded border border-border bg-muted px-1 text-xs">Ctrl F</kbd> / <kbd className="rounded border border-border bg-muted px-1 text-xs">⌘ F</kbd> to search this page.
        </p>

        {empty ? (
          <p className="py-6 text-muted-foreground">No fandoms found.</p>
        ) : (
          <>
            <nav id="alphabet" className="mb-5 flex flex-wrap gap-1.5 border-border border-y py-2.5">
              {letters.map((l) => (
                <a key={l.letter} href={`#letter-${l.letter}`}
                  className="grid size-7 place-items-center rounded-md font-medium text-[13px] text-foreground/70 tabular-nums hover:bg-muted hover:text-foreground hover:no-underline">
                  {l.letter}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-6">
              {letters.map((l) => (
                <section key={l.letter} id={`letter-${l.letter}`} className="scroll-mt-4">
                  <h3 className="mb-2 flex items-baseline gap-2 border-border border-b pb-1 font-semibold text-base">
                    {l.letter}
                    <a href="#alphabet" className="text-muted-foreground text-xs hover:text-foreground hover:no-underline" title="Back to top">↑</a>
                  </h3>
                  <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {l.fandoms.map((f, i) => (
                      <li key={i} className="text-sm">
                        <a href={f.url ?? "#"} className="text-link hover:underline">{f.name}</a>
                        {n(f.count) != null && <span className="text-muted-foreground tabular-nums"> ({n(f.count)})</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
