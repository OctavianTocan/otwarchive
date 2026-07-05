import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@/design-system": resolve(__dirname, "design-system") } },
  define: { "process.env.NODE_ENV": '"production"' },
  ssr: { noExternal: true },
  build: {
    ssr: resolve(__dirname, "ssr/ssr.tsx"),
    outDir: resolve(__dirname, "../../spike/ssr"),
    emptyOutDir: false,
    rollupOptions: { output: { entryFileNames: "ssr.mjs", inlineDynamicImports: true } },
  },
});
