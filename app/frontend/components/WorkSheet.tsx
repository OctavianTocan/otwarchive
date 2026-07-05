import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";

type TagRef = { name: string };
type WorkProps = {
  work?: { title: string; authors?: { name: string }[]; ratings?: TagRef[]; warnings?: TagRef[]; fandoms?: TagRef[] };
  pageTitle?: string;
  summaryHtml?: string | null;
  chapters?: { position: number; title?: string | null; contentHtml: string | null }[];
};

async function loadWork(id: number): Promise<WorkProps | null> {
  try {
    const html = await (await fetch(`/works/${id}?view_full_work=true&view_adult=true`, { headers: { Accept: "text/html" } })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const script = doc.querySelector('script[data-page="app"]');
    return script?.textContent ? (JSON.parse(script.textContent).props as WorkProps) : null;
  } catch { return null; }
}

/** Mobile bottom sheet that reads a fic inline (cogram-style) without leaving the list. */
export default function WorkSheet({ workId, workUrl, onClose }: { workId: number | null; workUrl: string | null; onClose: () => void }) {
  const [data, setData] = useState<WorkProps | null>(null);
  const [loading, setLoading] = useState(false);
  const open = workId != null;

  useEffect(() => {
    if (workId == null) return;
    setLoading(true); setData(null);
    let alive = true;
    loadWork(workId).then((d) => { if (alive) { setData(d); setLoading(false); } });
    return () => { alive = false; };
  }, [workId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  const title = data?.work?.title ?? data?.pageTitle ?? "Loading…";

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-x-0 bottom-0 z-50 flex h-[93svh] flex-col rounded-t-2xl border-border border-t bg-background shadow-[0_-8px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-border" aria-hidden />
        <header className="flex items-center gap-3 border-border border-b px-4 py-3">
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-muted"><XIcon className="size-5" /></button>
          <h3 className="min-w-0 flex-1 truncate font-semibold text-[15px]">{title}</h3>
          {workUrl && <a href={workUrl} className="shrink-0 text-link text-sm hover:underline">Open →</a>}
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {loading && <p className="py-10 text-center text-muted-foreground">Loading…</p>}
          {data?.work && (
            <article>
              <h2 className="font-semibold text-xl leading-tight">{data.work.title}</h2>
              {data.work.authors && <p className="mt-1 text-muted-foreground text-sm">by {data.work.authors.map((a) => a.name).join(", ")}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...(data.work.ratings ?? []), ...(data.work.fandoms ?? []), ...(data.work.warnings ?? [])].map((t, i) => (
                  <span key={i} className="rounded-md border border-border px-2 py-0.5 text-muted-foreground text-xs">{t.name}</span>
                ))}
              </div>
              {data.summaryHtml && <div className="userstuff mt-4 rounded-md border-primary/30 border-l-2 bg-muted/40 px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: data.summaryHtml }} />}
              <div className="mt-6 flex flex-col gap-8">
                {(data.chapters ?? []).map((ch) => (
                  <section key={ch.position}>
                    {(data.chapters ?? []).length > 1 && <h3 className="mb-2 font-semibold text-muted-foreground text-sm">Chapter {ch.position}{ch.title ? `: ${ch.title}` : ""}</h3>}
                    <div className="userstuff text-[15px] leading-relaxed [&_p]:my-3" dangerouslySetInnerHTML={{ __html: ch.contentHtml ?? "" }} />
                  </section>
                ))}
              </div>
            </article>
          )}
          {!loading && !data && open && <p className="py-10 text-center text-muted-foreground">Couldn't load. <a href={workUrl ?? "#"} className="text-link hover:underline">Open the page →</a></p>}
        </div>
      </div>
    </>
  );
}
