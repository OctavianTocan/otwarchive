import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
import "@/design-system/styles/globals.css";

const pages = import.meta.glob("../pages/**/*.tsx", { eager: true });

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const p = pages[`../pages/${name}.tsx`];
      if (!p) throw new Error(`SSR page not found: ${name}`);
      return p as { default: unknown };
    },
    setup: ({ App, props }) => <App {...props} />,
  }),
);
