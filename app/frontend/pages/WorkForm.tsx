import { router, useForm } from "@inertiajs/react";
import type { FormDataConvertible, RequestPayload } from "@inertiajs/core";
import AppShell from "../components/AppShell";
import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";
import { Card } from "@/design-system/components/ui/card";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Textarea } from "@/design-system/components/ui/textarea";

type Opt = { id: number; name: string };
type LangOpt = { id: number; name: string; short?: string | null };
type PubDate = { day: number | null; month: number | null; year: number | null };

type WorkValues = {
  title?: string;
  rating_string?: string;
  archive_warning_strings?: string[];
  category_strings?: string[];
  fandom_string?: string;
  relationship_string?: string;
  character_string?: string;
  freeform_string?: string;
  summary?: string;
  notes?: string;
  endnotes?: string;
  language_id?: number | null;
  collection_names?: string | null;
  recipients?: string | null;
  backdate?: boolean;
  restricted?: boolean;
  moderated_commenting_enabled?: boolean;
  comment_permissions?: string;
  chaptered?: boolean;
  wip_length?: number | string | null;
  current_user_pseud_ids?: number[];
  chapter?: { title?: string | null; content?: string | null; published_at?: PubDate };
};

type Props = {
  mode: "new" | "edit";
  action: string;
  method: "post" | "put";
  posted: boolean;
  work: WorkValues;
  options: {
    ratings: Opt[];
    warnings: Opt[];
    categories: Opt[];
    languages: LangOpt[];
    pseuds: Opt[];
    series: { id: number; title: string }[];
  };
  autocomplete: Record<string, string>;
  errors: Record<string, string[]> | null;
};

// Flatten the nested React form state into the exact `work[...]` params the
// Rails controller permits, including the multiparameter published_at(Ni) keys.
function toPayload(v: WorkValues, button: string): RequestPayload {
  const pub = v.chapter?.published_at;
  const work: Record<string, FormDataConvertible> = {
    title: v.title ?? "",
    rating_string: v.rating_string ?? "",
    archive_warning_strings: v.archive_warning_strings ?? [],
    category_strings: v.category_strings ?? [],
    fandom_string: v.fandom_string ?? "",
    relationship_string: v.relationship_string ?? "",
    character_string: v.character_string ?? "",
    freeform_string: v.freeform_string ?? "",
    summary: v.summary ?? "",
    notes: v.notes ?? "",
    endnotes: v.endnotes ?? "",
    language_id: v.language_id ?? "",
    collection_names: v.collection_names ?? "",
    recipients: v.recipients ?? "",
    backdate: v.backdate ? "1" : "0",
    restricted: v.restricted ? "1" : "0",
    moderated_commenting_enabled: v.moderated_commenting_enabled ? "1" : "0",
    comment_permissions: v.comment_permissions ?? "enable_all",
    wip_length: v.chaptered ? (v.wip_length ?? "") : "1",
    current_user_pseud_ids: v.current_user_pseud_ids ?? [],
    chapter_attributes: {
      title: v.chapter?.title ?? "",
      content: v.chapter?.content ?? "",
      // Rails multiparameter date assignment: work[chapter_attributes][published_at(3i|2i|1i)]
      "published_at(3i)": pub?.day ?? "",
      "published_at(2i)": pub?.month ?? "",
      "published_at(1i)": pub?.year ?? "",
    },
  };
  return { work, [button]: "1" };
}

function FieldError({ errors, keys }: { errors: Props["errors"]; keys: string[] }) {
  if (!errors) return null;
  const msgs = keys.flatMap((k) => errors[k] ?? []);
  if (msgs.length === 0) return null;
  return <p className="mt-1 text-destructive text-xs">{msgs.join(", ")}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-4 px-5 py-4">
      <h3 className="min-w-0 break-words font-semibold text-base">{title}</h3>
      {children}
    </Card>
  );
}

export default function WorkForm({ mode, action, method, posted, work, options, errors }: Props) {
  const { data, setData, processing } = useForm<WorkValues>(work);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const set = <K extends keyof WorkValues>(k: K, val: WorkValues[K]) => {
    setData((previous) => ({ ...previous, [k]: val }));
  };
  const setChapter = (patch: Partial<NonNullable<WorkValues["chapter"]>>) =>
    setData("chapter", { ...(data.chapter ?? {}), ...patch });
  const setPub = (patch: Partial<PubDate>) =>
    setChapter({ published_at: { ...(data.chapter?.published_at ?? { day: null, month: null, year: null }), ...patch } });

  const toggleList = (k: "archive_warning_strings" | "category_strings", name: string) => {
    const cur = data[k] ?? [];
    set(k, cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]);
  };

  const submit = (button: string) => {
    setSubmitting(button);
    const payload = toPayload(data, button);
    const opts = { forceFormData: false, onFinish: () => setSubmitting(null) };
    if (method === "put") router.put(action, payload, opts);
    else router.post(action, payload, opts);
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-input px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/40";
  const busy = processing || submitting !== null;

  return (
    <AppShell>

      <div className="mx-auto grid max-w-[820px] gap-5 px-5 pt-6 pb-24">
        {errors?.base && (
          <Card className="border-destructive/40 bg-destructive/5 px-5 py-3 text-destructive">
            <ul className="list-disc pl-5 text-sm">{errors.base.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </Card>
        )}

        <Section title="Tags">
          <div>
            <Label htmlFor="rating">Rating *</Label>
            <select id="rating" className={inputCls} value={data.rating_string ?? ""} onChange={(e) => set("rating_string", e.target.value)}>
              {options.ratings.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
            <FieldError errors={errors} keys={["rating"]} />
          </div>

          <fieldset>
            <legend className="mb-1.5 font-medium text-sm">Archive Warnings *</legend>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {options.warnings.map((w) => (
                <label key={w.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={(data.archive_warning_strings ?? []).includes(w.name)} onCheckedChange={() => toggleList("archive_warning_strings", w.name)} />
                  {w.name}
                </label>
              ))}
            </div>
            <FieldError errors={errors} keys={["archive_warnings", "archive_warning_strings"]} />
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 font-medium text-sm">Categories</legend>
            <div className="grid gap-1.5 sm:grid-cols-3">
              {options.categories.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={(data.category_strings ?? []).includes(c.name)} onCheckedChange={() => toggleList("category_strings", c.name)} />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>

          <TokenField label="Fandoms *" value={data.fandom_string ?? ""} onChange={(v) => set("fandom_string", v)} />
          <FieldError errors={errors} keys={["fandom", "fandoms"]} />
          <TokenField label="Relationships" value={data.relationship_string ?? ""} onChange={(v) => set("relationship_string", v)} />
          <TokenField label="Characters" value={data.character_string ?? ""} onChange={(v) => set("character_string", v)} />
          <TokenField label="Additional Tags" value={data.freeform_string ?? ""} onChange={(v) => set("freeform_string", v)} />
        </Section>

        <Section title="Preface">
          <div>
            <Label htmlFor="title">Work Title *</Label>
            <Input id="title" value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} />
            <FieldError errors={errors} keys={["title"]} />
          </div>
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" value={data.summary ?? ""} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notes (beginning)</Label>
            <Textarea id="notes" value={data.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endnotes">End Notes</Label>
            <Textarea id="endnotes" value={data.endnotes ?? ""} onChange={(e) => set("endnotes", e.target.value)} />
          </div>
        </Section>

        <Section title="Associations">
          <div>
            <Label htmlFor="collections">Post to Collections / Challenges</Label>
            <Input id="collections" value={data.collection_names ?? ""} onChange={(e) => set("collection_names", e.target.value)} placeholder="comma-separated collection names" />
          </div>
          <div>
            <Label htmlFor="recipients">Gift this work to</Label>
            <Input id="recipients" value={data.recipients ?? ""} onChange={(e) => set("recipients", e.target.value)} placeholder="comma-separated pseuds" />
          </div>
          <div>
            <Label htmlFor="language">Language *</Label>
            <select id="language" className={inputCls} value={data.language_id ?? ""} onChange={(e) => set("language_id", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Please select a language</option>
              {options.languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <FieldError errors={errors} keys={["language", "language_id"]} />
          </div>
          {options.pseuds.length > 1 && (
            <fieldset>
              <legend className="mb-1.5 font-medium text-sm">Creator/Pseud(s)</legend>
              <div className="grid gap-1.5 sm:grid-cols-3">
                {options.pseuds.map((p) => {
                  const ids = data.current_user_pseud_ids ?? [];
                  return (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox checked={ids.includes(p.id)} onCheckedChange={() => set("current_user_pseud_ids", ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id])} />
                      {p.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </Section>

        <Section title="Chapters & Publication">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={!!data.chaptered} onCheckedChange={(c) => set("chaptered", !!c)} />
            This work has multiple chapters
          </label>
          {data.chaptered && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wip">Chapter 1 of</Label>
                <Input id="wip" value={String(data.wip_length ?? "")} onChange={(e) => set("wip_length", e.target.value)} placeholder="? for unknown" />
              </div>
              <div>
                <Label htmlFor="ctitle">Chapter Title</Label>
                <Input id="ctitle" value={data.chapter?.title ?? ""} onChange={(e) => setChapter({ title: e.target.value })} />
              </div>
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={!!data.backdate} onCheckedChange={(c) => set("backdate", !!c)} />
            Set a different publication date
          </label>
          {data.backdate && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pd">Day</Label>
                <Input id="pd" type="number" min={1} max={31} value={data.chapter?.published_at?.day ?? ""} onChange={(e) => setPub({ day: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label htmlFor="pm">Month</Label>
                <Input id="pm" type="number" min={1} max={12} value={data.chapter?.published_at?.month ?? ""} onChange={(e) => setPub({ month: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label htmlFor="py">Year</Label>
                <Input id="py" type="number" value={data.chapter?.published_at?.year ?? ""} onChange={(e) => setPub({ year: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
          )}
        </Section>

        <Section title="Privacy">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={!!data.restricted} onCheckedChange={(c) => set("restricted", !!c)} />
            Only show your work to registered users
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={!!data.moderated_commenting_enabled} onCheckedChange={(c) => set("moderated_commenting_enabled", !!c)} />
            Enable comment moderation
          </label>
          <div>
            <Label htmlFor="cperm">Who can comment</Label>
            <select id="cperm" className={inputCls} value={data.comment_permissions ?? "enable_all"} onChange={(e) => set("comment_permissions", e.target.value)}>
              <option value="enable_all">Registered users and guests can comment</option>
              <option value="disable_anon">Only registered users can comment</option>
              <option value="disable_all">No one can comment</option>
            </select>
          </div>
        </Section>

        <Section title="Work Text *">
          <Textarea className="min-h-64 font-mono" value={data.chapter?.content ?? ""} onChange={(e) => setChapter({ content: e.target.value })} placeholder="Your work text (HTML allowed)" />
          <FieldError errors={errors} keys={["content", "chapter", "base"]} />
        </Section>

        <div className="sticky bottom-0 flex flex-wrap gap-2 border-border border-t bg-background/95 py-3 backdrop-blur">
          {!posted && <Button variant="outline" disabled={busy} onClick={() => submit("save_button")}>Save Without Posting</Button>}
          <Button variant="outline" disabled={busy} onClick={() => submit("preview_button")}>Preview</Button>
          <Button variant="default" disabled={busy} onClick={() => submit(posted ? "update_button" : "post_button")}>
            {posted ? "Update" : "Post"}
          </Button>
          <a href={mode === "edit" ? action : "/works"} className="ml-auto self-center text-muted-foreground text-sm hover:underline">Cancel</a>
        </div>
      </div>
    </AppShell>
  );
}

// v1 tag input: freeform comma-separated string matching the AO3 `*_string`
// param shape. Autocomplete against /autocomplete/* is a follow-up.
function TokenField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="comma-separated tags" />
    </div>
  );
}
