// Smoke parity for the simpler converted index pages: React renders with data
// and the ERB (?ui=legacy) baseline still serves.
const BASE = process.env.BASE ?? "http://127.0.0.1:3013";
const PAGES = [
  { name: "series", path: "/users/testuser/series", comp: "SeriesIndex", key: "series" },
  { name: "collections", path: "/collections", comp: "CollectionsIndex", key: "collections" },
];
let pass = 0;
for (const pg of PAGES) {
  const react = await (await fetch(`${BASE}${pg.path}`, { headers: { "X-Inertia": "true" } })).json();
  const erbStatus = (await fetch(`${BASE}${pg.path}?ui=legacy`)).status;
  const count = react.props?.pagination?.count ?? 0;
  const items = (react.props?.[pg.key] ?? []).length;
  const ok = react.component === pg.comp && count > 0 && items > 0 && erbStatus === 200;
  if (ok) pass++;
  console.log(`[${ok ? "PASS" : "FAIL"}] ${pg.name}  (react=${react.component} count=${count} items=${items} erb=${erbStatus})`);
}
console.log(`\n=== INDEX SMOKE: ${pass}/${PAGES.length} passed ===`);
process.exit(pass === PAGES.length ? 0 : 1);
