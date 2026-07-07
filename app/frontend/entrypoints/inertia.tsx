import "@/design-system/styles/globals.css";
import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { LoadingPanel } from "../components/shared/LoadingPanel";

type PageModule = {
  readonly default: ResolvedComponent;
};

const pages = import.meta.glob<PageModule>("../pages/**/*.tsx");
const enableReactDevTools = import.meta.env.DEV && import.meta.env.VITE_DISABLE_REACT_DEVTOOLS !== "1";
const AgentationPanel = enableReactDevTools
  ? lazy(() => import("agentation").then(({ Agentation }) => ({ default: Agentation })))
  : null;

function agentationEndpoint() {
  if (import.meta.env.VITE_AGENTATION_ENDPOINT) return import.meta.env.VITE_AGENTATION_ENDPOINT;
  if (window.location.hostname.endsWith(".ts.net")) return `${window.location.protocol}//${window.location.hostname}:9482`;
  return "http://localhost:4747";
}

if (enableReactDevTools) {
  const [{ init }, { scan }] = await Promise.all([import("grab"), import("react-scan")]);
  init();
  scan({ enabled: true });
}

createInertiaApp({
  resolve: async (name) => {
    const loadPage = pages[`../pages/${name}.tsx`];
    if (!loadPage) {
      throw new Error(`Inertia page not found: ${name}`);
    }

    return (await loadPage()).default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <Suspense fallback={<LoadingPanel label="Loading the Archive" surface="screen" />}>
        <App {...props} />
        {AgentationPanel && (
          <Suspense fallback={null}>
            <AgentationPanel endpoint={agentationEndpoint()} />
          </Suspense>
        )}
      </Suspense>,
    );
  },
});
