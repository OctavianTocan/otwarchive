// Work-show parity: React Inertia props vs the ERB (?ui=legacy) page.
import { parseHTML } from "linkedom";

const BASE = process.env.BASE ?? "http://127.0.0.1:3013";
const num = (s) => (s == null ? 0 : parseInt(String(s).replace(/[^0-9]/g, ""), 10) || 0);

// Work ids to check (single + multi-chapter). Multi-chapter needs view_full_work.
const FIXTURES = [
  { id: 2, params: {} },
  { id: 1, params: { view_full_work: "true" } },
  { id: 108, params: {} },
];

const qs = (p) => Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

async function reactData(id, params) {
  const url = `${BASE}/works/${id}${Object.keys(params).length ? "?" + qs(params) : ""}`;
  const j = await (await fetch(url, { headers: { "X-Inertia": "true" } })).json();
  const p = j.props;
  return {
    title: p.work?.title ?? p.pageTitle,
    words: p.stats?.words ?? 0, kudos: p.stats?.kudos ?? 0,
    comments: p.stats?.comments ?? 0, hits: p.stats?.hits ?? 0,
    chapters: (p.chapters ?? []).length,
  };
}

async function erbData(id, params) {
  const url = `${BASE}/works/${id}?${qs({ ...params, ui: "legacy" })}`;
  const html = await (await fetch(url)).text();
  const { document } = parseHTML(html);
  const st = (cls) => document.querySelector(`dd.${cls}`)?.textContent?.trim();
  return {
    title: document.querySelector("h2.title, h2.heading")?.textContent?.trim() ?? null,
    words: num(st("words")), kudos: num(st("kudos")), comments: num(st("comments")), hits: num(st("hits")),
    chapters: document.querySelectorAll("#chapters .chapter, div.chapter[id^=chapter]").length || 1,
  };
}

let pass = 0;
for (const fx of FIXTURES) {
  const [r, e] = await Promise.all([reactData(fx.id, fx.params), erbData(fx.id, fx.params)]);
  const issues = [];
  for (const f of ["words", "kudos", "comments", "hits"]) if (r[f] !== e[f]) issues.push(`${f}: react=${r[f]} erb=${e[f]}`);
  if (e.title && r.title && !e.title.includes(r.title) && !r.title.includes(e.title)) issues.push(`title: react=${JSON.stringify(r.title)} erb=${JSON.stringify(e.title)}`);
  const ok = issues.length === 0;
  if (ok) pass++;
  console.log(`[${ok ? "PASS" : "FAIL"}] work ${fx.id}  (react "${r.title}" w=${r.words} k=${r.kudos} c=${r.comments} ch=${r.chapters})`);
  issues.forEach((i) => console.log("   ✗ " + i));
}
console.log(`\n=== WORK-SHOW PARITY: ${pass}/${FIXTURES.length} passed ===`);
process.exit(pass === FIXTURES.length ? 0 : 1);
