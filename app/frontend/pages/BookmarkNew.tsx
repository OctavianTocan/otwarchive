import { useForm } from "@inertiajs/react";
import type { RequestPayload } from "@inertiajs/core";
import AppShell from "../components/AppShell";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Textarea } from "@/design-system/components/ui/textarea";
import { Label } from "@/design-system/components/ui/label";

type Props = {
  context: { heading: string };
  work: { title: string; url: string | null };
  action: string; method: "post" | "put";
  pseuds: { id: number; name: string }[];
  values: { pseud_id: number | null; bookmarker_notes: string | null; tag_string: string | null; collection_names: string | null; private: boolean; rec: boolean };
  errors: Record<string, string[]> | null;
};

export default function BookmarkNew({ context, work, action, method, pseuds, values, errors }: Props) {
  const form = useForm({
    pseud_id: values.pseud_id ?? pseuds[0]?.id ?? "",
    bookmarker_notes: values.bookmarker_notes ?? "",
    tag_string: values.tag_string ?? "",
    collection_names: values.collection_names ?? "",
    private: values.private,
    rec: values.rec,
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const opts = { preserveScroll: true };
    const payload: RequestPayload = { bookmark: form.data };
    form.transform(() => payload);
    if (method === "put") form.put(action, opts);
    else form.post(action, opts);
  };
  const err = (k: string) => errors?.[k]?.[0];

  return (
    <AppShell>
      <div className="mx-auto max-w-[720px] px-4 pt-6 pb-16 md:px-5">
        <h2 className="font-semibold text-base">{context.heading}</h2>
        <p className="mt-0.5 mb-5 text-muted-foreground text-sm">
          for <a href={work.url ?? "#"} className="text-link hover:underline">{work.title}</a>
        </p>
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 border-destructive/40 border-l-2 bg-destructive/5 px-3 py-2 text-destructive text-sm">
            {Object.values(errors).flat().map((m, i) => <div key={i}>{m}</div>)}
          </div>
        )}
        <form onSubmit={submit} className="flex flex-col gap-4">
          {pseuds.length > 1 && (
            <div>
              <Label>Bookmark as</Label>
              <select value={form.data.pseud_id} onChange={(e) => form.setData("pseud_id", Number(e.target.value))}
                className="w-full rounded-md border border-border bg-input px-2.5 py-1.5 text-sm">
                {pseuds.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <Label>Notes</Label>
            <Textarea value={form.data.bookmarker_notes} onChange={(e) => form.setData("bookmarker_notes", e.target.value)} rows={4} />
            {err("bookmarker_notes") && <p className="mt-1 text-destructive text-xs">{err("bookmarker_notes")}</p>}
          </div>
          <div>
            <Label>Your tags (comma separated)</Label>
            <Input value={form.data.tag_string} onChange={(e) => form.setData("tag_string", e.target.value)} placeholder="tag, another tag" />
          </div>
          <div>
            <Label>Collections (comma separated)</Label>
            <Input value={form.data.collection_names} onChange={(e) => form.setData("collection_names", e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.private} onChange={(e) => form.setData("private", e.target.checked)} className="accent-primary" /> Private bookmark</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.rec} onChange={(e) => form.setData("rec", e.target.checked)} className="accent-primary" /> Rec</label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="default" disabled={form.processing}>Create Bookmark</Button>
            <Button type="button" variant="outline" render={<a href={work.url ?? "/"} />}>Cancel</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
