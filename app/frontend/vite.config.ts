import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const devPort = Number(process.env.VITE_DEV_PORT ?? 3037);
const devOrigin = process.env.VITE_DEV_ORIGIN;
const tailnetHost = process.env.VITE_TAILNET_HOST;

// Host-built Inertia client + ai-app-template design system (Tailwind v4).
export default defineConfig({
  base: "/vite-inertia/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@/design-system": resolve(__dirname, "design-system") } },
  define: { "process.env.NODE_ENV": '"production"' },
  server: {
    cors: true,
    port: devPort,
    strictPort: true,
    ...(devOrigin ? { origin: devOrigin } : {}),
    ...(tailnetHost
      ? {
          allowedHosts: [tailnetHost],
          hmr: { clientPort: devPort, host: tailnetHost, protocol: "wss" as const },
        }
      : {}),
  },
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
