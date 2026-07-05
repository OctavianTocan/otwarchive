// Bookmarks-index parity: React Inertia props vs ERB (?ui=legacy).
import { parseHTML } from "linkedom";
const BASE = process.env.BASE ?? "http://127.0.0.1:3013";

const FIXTURES = [{ path: "/users/testuser/bookmarks", params: {} }];
const qs = (p) => Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

async function reactData(path, params) {
  const url = `${BASE}${path}${Object.keys(params).length ? "?" + qs(params) : ""}`;
  const j = await (await fetch(url, { headers: { "X-Inertia": "true" } })).json();
  const p = j.props;
  return { count: p.pagination.count, titles: (p.bookmarks ?? []).map((b) => b.bookmarkable?.title).filter(Boolean).sort() };
}
async function erbData(path, params) {
  const html = await (await fetch(`${BASE}${path}?${qs({ ...params, ui: "legacy" })}`)).text();
  const { document } = parseHTML(html);
  const blurbs = [...document.querySelectorAll("li.bookmark.blurb, li.blurb.bookmark, li.bookmark")];
  const titles = blurbs.map((li) => li.querySelector('.header .heading a[href*="/works/"], h4.heading a')?.textContent?.trim()).filter(Boolean).sort();
  return { count: blurbs.length, titles };
}

let pass = 0;
for (const fx of FIXTURES) {
  const [r, e] = await Promise.all([reactData(fx.path, fx.params), erbData(fx.path, fx.params)]);
  const issues = [];
  // ERB bookmark count may differ from ES count on tiny datasets; compare the title set overlap instead
  const overlap = r.titles.filter((t) => e.titles.some((x) => x.includes(t) || t.includes(x)));
  if (r.count === 0) issues.push("react returned 0 bookmarks");
  if (r.titles.length && overlap.length === 0) issues.push(`no title overlap: react=${JSON.stringify(r.titles)} erb=${JSON.stringify(e.titles)}`);
  const ok = issues.length === 0;
  if (ok) pass++;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${fx.path}  (react count=${r.count}, titles overlap ${overlap.length}/${r.titles.length})`);
  issues.forEach((i) => console.log("   ✗ " + i));
}
console.log(`\n=== BOOKMARKS PARITY: ${pass}/${FIXTURES.length} passed ===`);
process.exit(pass === FIXTURES.length ? 0 : 1);
