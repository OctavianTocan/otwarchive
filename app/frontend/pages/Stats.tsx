import AppShell from "../components/AppShell";
import { Card } from "@/design-system/components/ui/card";

type Fandom = {
  name: string;
  works: number;
  words: number;
  hits: number;
  kudos: number;
  comments: number;
  bookmarks: number;
};
type Props = {
  context: { heading: string };
  totals: {
    works: number;
    words: number;
    hits: number;
    kudos: number;
    comments: number;
    bookmarks: number;
    subscriptions: number;
  };
  fandoms: Fandom[];
};

const n = (v?: number) => (v ?? 0).toLocaleString("en-US");

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-semibold text-xl tabular-nums">{n(value)}</dd>
    </div>
  );
}

const COLS: { key: keyof Fandom; label: string }[] = [
  { key: "works", label: "Works" },
  { key: "words", label: "Words" },
  { key: "hits", label: "Hits" },
  { key: "kudos", label: "Kudos" },
  { key: "comments", label: "Comment Threads" },
  { key: "bookmarks", label: "Bookmarks" },
];

export default function Stats({ context, totals, fandoms }: Props) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5">
        <main>
          <h2 className="break-words font-semibold text-base">{context.heading || "Statistics"}</h2>

          <Card className="mt-4 px-5">
            <h3 className="font-bold text-lg">Totals</h3>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              <Stat label="Works" value={totals.works} />
              <Stat label="Words" value={totals.words} />
              <Stat label="Hits" value={totals.hits} />
              <Stat label="Kudos" value={totals.kudos} />
              <Stat label="Comment Threads" value={totals.comments} />
              <Stat label="Bookmarks" value={totals.bookmarks} />
              <Stat label="Subscriptions" value={totals.subscriptions} />
            </dl>
          </Card>

          <section className="mt-8">
            <h3 className="mb-3 font-bold text-lg">By fandom</h3>
            {fandoms.length === 0 ? (
              <p className="py-8 text-muted-foreground">No fandom statistics yet.</p>
            ) : (
              <div className="overflow-x-auto bg-card">
                <table className="w-full text-sm tabular-nums">
                  <thead>
                    <tr className="border-border border-b text-left text-muted-foreground text-xs">
                      <th className="px-4 py-2 font-semibold">Fandom</th>
                      {COLS.map((c) => (
                        <th key={c.key} className="px-4 py-2 text-right font-semibold">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fandoms.map((f) => (
                      <tr key={f.name} className="border-border border-b transition-colors last:border-b-0 hover:bg-muted/30">
                        <th scope="row" className="px-4 py-2 text-left font-medium">{f.name}</th>
                        {COLS.map((c) => (
                          <td key={c.key} className="px-4 py-2 text-right">{n(f[c.key] as number)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </AppShell>
  );
}
