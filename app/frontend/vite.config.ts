import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Host-built Inertia client + ai-app-template design system (Tailwind v4).
export default defineConfig({
  base: "/vite-inertia/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@/design-system": resolve(__dirname, "design-system") } },
  define: { "process.env.NODE_ENV": '"production"' },
  build: {
    outDir: resolve(__dirname, "../../public/vite-inertia"),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        inertia: resolve(__dirname, "entrypoints/inertia.tsx"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
