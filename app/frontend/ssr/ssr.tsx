import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
import "@/design-system/styles/globals.css";

type PageModule = {
  readonly default: ResolvedComponent;
};

const pages = import.meta.glob<PageModule>("../pages/**/*.tsx", { eager: true });

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const p = pages[`../pages/${name}.tsx`];
      if (!p) throw new Error(`SSR page not found: ${name}`);
      return p.default;
    },
    setup: ({ App, props }) => <App {...props} />,
  }),
);
