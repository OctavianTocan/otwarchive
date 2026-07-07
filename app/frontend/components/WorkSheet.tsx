import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { XIcon } from "lucide-react";

type TagRef = { readonly name: string };
type WorkProps = {
  readonly work?: {
    readonly title: string;
    readonly authors?: readonly TagRef[];
    readonly ratings?: readonly TagRef[];
    readonly warnings?: readonly TagRef[];
    readonly fandoms?: readonly TagRef[];
  };
  readonly pageTitle?: string;
  readonly summaryHtml?: string | null;
  readonly chapters?: readonly { readonly position: number; readonly title?: string | null; readonly contentHtml: string | null }[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isList = (value: unknown): value is readonly unknown[] => Array.isArray(value);
const nullableString = (value: unknown) => (typeof value === "string" || value === null ? value : null);

function tags(value: unknown): readonly TagRef[] | undefined {
  if (!isList(value)) return undefined;

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.name !== "string") return [];
    return [{ name: item.name }];
  });
}

function chapters(value: unknown): WorkProps["chapters"] {
  if (!isList(value)) return undefined;

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.position !== "number") return [];

    return [{
      contentHtml: nullableString(item.contentHtml),
      position: item.position,
      title: nullableString(item.title),
    }];
  });
}

function work(value: unknown): WorkProps["work"] {
  if (!isRecord(value) || typeof value.title !== "string") return undefined;

  const authors = tags(value.authors);
  const fandoms = tags(value.fandoms);
  const ratings = tags(value.ratings);
  const warnings = tags(value.warnings);

  return {
    title: value.title,
    ...(authors ? { authors } : {}),
    ...(fandoms ? { fandoms } : {}),
    ...(ratings ? { ratings } : {}),
    ...(warnings ? { warnings } : {}),
  };
}

function propsFromPage(value: unknown): WorkProps | null {
  if (!isRecord(value) || !isRecord(value.props)) return null;

  const parsedChapters = chapters(value.props.chapters);
  const parsedWork = work(value.props.work);
  const pageTitle = typeof value.props.pageTitle === "string" ? value.props.pageTitle : undefined;

  return {
    summaryHtml: nullableString(value.props.summaryHtml),
    ...(pageTitle ? { pageTitle } : {}),
    ...(parsedChapters ? { chapters: parsedChapters } : {}),
    ...(parsedWork ? { work: parsedWork } : {}),
  };
}

async function loadWork(id: number): Promise<WorkProps | null> {
  try {
    const html = await (await fetch(`/works/${id}?view_full_work=true&view_adult=true`, { headers: { Accept: "text/html" } })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const script = doc.querySelector('script[data-page="app"]');
    return script?.textContent ? propsFromPage(JSON.parse(script.textContent)) : null;
  } catch (error) {
    if (error instanceof Error) return null;
    throw error;
  }
}

type WorkSheetProps = {
  readonly dialogRef: RefObject<HTMLDialogElement | null>;
  readonly workId: number | null;
  readonly workUrl: string | null;
  readonly onClose: () => void;
};

export default function WorkSheet({ dialogRef, workId, workUrl, onClose }: WorkSheetProps) {
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

  const title = data?.work?.title ?? data?.pageTitle ?? "Loading…";
  const close = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
      return;
    }

    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="work-sheet-title"
      className="fixed inset-x-0 bottom-0 top-auto z-50 m-0 h-[93svh] max-h-[93svh] w-full max-w-none rounded-t-2xl border-border border-t bg-background p-0 text-foreground shadow-[0_-8px_40px_rgba(0,0,0,0.18)] backdrop:bg-black/50 open:flex open:flex-col"
      onClose={onClose}
    >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-border" aria-hidden />
        <header className="flex items-center gap-3 border-border border-b px-4 py-3">
          <button type="button" onClick={close} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-muted"><XIcon className="size-5" /></button>
          <h3 id="work-sheet-title" className="min-w-0 flex-1 truncate font-semibold text-[15px]">{title}</h3>
          {workUrl && <a href={workUrl} className="shrink-0 text-link text-sm hover:underline">Open →</a>}
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {loading && <p className="py-10 text-center text-muted-foreground">Loading…</p>}
          {data?.work && (
            <article>
              <h2 className="font-semibold text-xl leading-tight">{data.work.title}</h2>
              {data.work.authors && <p className="mt-1 text-muted-foreground text-sm">by {data.work.authors.map((a) => a.name).join(", ")}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(data.work.ratings ?? []).map((tag) => (
                  <span key={`rating-${tag.name}`} className="rounded-md border border-border px-2 py-0.5 text-muted-foreground text-xs">{tag.name}</span>
                ))}
                {(data.work.fandoms ?? []).map((tag) => (
                  <span key={`fandom-${tag.name}`} className="rounded-md border border-border px-2 py-0.5 text-muted-foreground text-xs">{tag.name}</span>
                ))}
                {(data.work.warnings ?? []).map((tag) => (
                  <span key={`warning-${tag.name}`} className="rounded-md border border-border px-2 py-0.5 text-muted-foreground text-xs">{tag.name}</span>
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
    </dialog>
  );
}
