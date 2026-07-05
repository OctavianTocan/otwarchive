export default function Hello({ name = "world" }: { name?: string }) {
  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ margin: 0 }}>Inertia + React live ✔</h1>
      <p>Hello, {name}. This page is rendered by React via Inertia, inside the AO3 Rails app — no backend rewrite.</p>
    </div>
  );
}
