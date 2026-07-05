import { parseHTML } from "linkedom";
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3013";
const CHROME = process.env.CHROME ?? "/root/.cloakbrowser/chromium-146.0.7680.177.3/chrome";
const RID_GA = "992891255"; // General Audiences

// Each fixture is one query the ERB and React pages must agree on.
const FIXTURES = [
  { name: "supernatural-all", path: "/tags/Supernatural/works", params: {} },
  { name: "supernatural-gen", path: "/tags/Supernatural/works", params: { "include_work_search[rating_ids][]": RID_GA } },
  { name: "supernatural-by-words", path: "/tags/Supernatural/works", params: { "work_search[sort_column]": "word_count" } },
  { name: "supernatural-complete", path: "/tags/Supernatural/works", params: { "work_search[complete]": "T" } },
  { name: "torchwood-all", path: "/tags/Torchwood/works", params: {} },
];

const qs = (params) => Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
const num = (s) => (s == null ? null : parseInt(String(s).replace(/[^0-9]/g, ""), 10) || 0);

async function erbData(path, params) {
  const url = `${BASE}${path}${Object.keys(params).length ? "?" + qs(params) : ""}`;
  const html = await (await fetch(url)).text();
  const { document } = parseHTML(html);
  const blurbs = [...document.querySelectorAll("li.work.blurb, li.blurb.work, li.work.blurb.group")];
  const works = blurbs.map((li) => {
    const idm = (li.id || "").match(/(\d+)/);
    const titleA = li.querySelector('.header .heading a[href*="/works/"], h4.heading a[href*="/works/"]');
    const st = (cls) => li.querySelector(`dd.${cls}`)?.textContent?.trim();
    return {
      id: idm ? Number(idm[1]) : null,
      title: titleA?.textContent?.trim() ?? null,
      words: num(st("words")) ?? 0, kudos: num(st("kudos")) ?? 0, comments: num(st("comments")) ?? 0,
      bookmarks: num(st("bookmarks")) ?? 0, hits: num(st("hits")) ?? 0, language: st("language") ?? null,
    };
  });
  // total count from the "Works (N)" heading if present, else blurb count
  const headTxt = document.querySelector("h2.heading, h3.heading")?.textContent ?? "";
  const cm = headTxt.match(/\(?\s*([\d,]+)\s*\)?\s*Works|Works\s*\(?\s*([\d,]+)/i);
  return { count: cm ? num(cm[1] || cm[2]) : works.length, works };
}

async function reactData(path, params) {
  const url = `${BASE}${path}?ui=react${Object.keys(params).length ? "&" + qs(params) : ""}`;
  const j = await (await fetch(url, { headers: { "X-Inertia": "true", "X-Requested-With": "XMLHttpRequest" } })).json();
  const p = j.props;
  return {
    count: p.pagination.count,
    works: p.works.map((w) => ({
      id: w.id, title: w.title, words: w.stats.words ?? 0, kudos: w.stats.kudos ?? 0,
      comments: w.stats.comments ?? 0, bookmarks: w.stats.bookmarks ?? 0, hits: w.stats.hits ?? 0,
      language: w.stats.language ?? null,
    })),
  };
}

function diff(erb, react) {
  const issues = [];
  if (erb.count !== react.count) issues.push(`count: erb=${erb.count} react=${react.count}`);
  const byId = (arr) => new Map(arr.map((w) => [w.id, w]));
  const em = byId(erb.works), rm = byId(react.works);
  // same set of work ids, same order
  const eIds = erb.works.map((w) => w.id).join(",");
  const rIds = react.works.map((w) => w.id).join(",");
  if (eIds !== rIds) issues.push(`work id order differs:\n   erb=[${eIds}]\n   react=[${rIds}]`);
  for (const id of em.keys()) {
    const e = em.get(id), r = rm.get(id);
    if (!r) { issues.push(`work ${id} missing in react`); continue; }
    for (const f of ["title", "words", "kudos", "comments", "bookmarks", "hits", "language"]) {
      if (String(e[f]) !== String(r[f])) issues.push(`work ${id} .${f}: erb=${JSON.stringify(e[f])} react=${JSON.stringify(r[f])}`);
    }
  }
  return issues;
}

async function a11y(browser, url) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const roles = await page.evaluate(() => {
    const q = (sel) => document.querySelectorAll(sel).length;
    return {
      main: q("main, [role=main]"), nav: q("nav, [role=navigation]"),
      headings: q("h1,h2,h3,h4,h5,h6,[role=heading]"), links: q("a[href], [role=link]"),
      lists: q("ul,ol,[role=list]"), listitems: q("li,[role=listitem]"),
      buttons: q("button,[role=button]"), formControls: q("input,select,textarea"),
      labels: q("label"), ariaLabelled: q("[aria-label],[aria-labelledby]"),
    };
  }).catch(() => ({}));
  await page.close();
  return { hasMain: (roles.main || 0) > 0, headings: roles.headings || 0, links: roles.links || 0, formControls: roles.formControls || 0, roles };
}

const out = { generated: new Date().toISOString(), fixtures: [] };
mkdirSync("shots", { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });

for (const fx of FIXTURES) {
  const [erb, react] = await Promise.all([erbData(fx.path, fx.params), reactData(fx.path, fx.params)]);
  const issues = diff(erb, react);
  const reactUrl = `${BASE}${fx.path}?ui=react${Object.keys(fx.params).length ? "&" + qs(fx.params) : ""}`;
  const erbUrl = `${BASE}${fx.path}${Object.keys(fx.params).length ? "?" + qs(fx.params) : ""}`;
  const [a11yReact, a11yErb] = await Promise.all([a11y(browser, reactUrl), a11y(browser, erbUrl)]);
  const rec = {
    name: fx.name, dataParity: issues.length === 0 ? "PASS" : "FAIL",
    erbCount: erb.count, reactCount: react.count, worksCompared: erb.works.length,
    issues, a11yReact, a11yErb,
  };
  out.fixtures.push(rec);
  console.log(`\n[${rec.dataParity}] ${fx.name}  (erb=${erb.count} react=${react.count}, ${erb.works.length} works compared)`);
  if (issues.length) issues.slice(0, 8).forEach((i) => console.log("   ✗ " + i));
  console.log(`   a11y react: main=${a11yReact.hasMain} headings=${a11yReact.headings} links=${a11yReact.links} | erb: headings=${a11yErb.headings} links=${a11yErb.links}`);
}

await browser.close();
writeFileSync("report.json", JSON.stringify(out, null, 2));
const passed = out.fixtures.filter((f) => f.dataParity === "PASS").length;
console.log(`\n=== DATA PARITY: ${passed}/${out.fixtures.length} fixtures passed ===`);
console.log("report.json written");
process.exit(passed === out.fixtures.length ? 0 : 1);
