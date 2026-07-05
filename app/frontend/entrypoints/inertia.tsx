import "@/design-system/styles/globals.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

const pages = import.meta.glob("../pages/**/*.tsx", { eager: true });

createInertiaApp({
  resolve: (name) => {
    const page = pages[`../pages/${name}.tsx`];
    if (!page) throw new Error(`Inertia page not found: ${name}`);
    return page as { default: unknown };
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
