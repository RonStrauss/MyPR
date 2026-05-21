import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { cloudflare } from "@cloudflare/vite-plugin";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(rootDir, "package.json"), "utf-8")
) as { version: string };

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    cloudflare(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["dumbbell.svg"],
      manifest: {
        name: "MyPR — Gym PR Tracker",
        short_name: "MyPR",
        description: "Track your gym personal records",
        theme_color: "#0d0d0f",
        background_color: "#0d0d0f",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/dumbbell.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/dumbbell.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase")) return "firebase";
          if (
            id.includes("react-router") ||
            id.includes("react-dom") ||
            /[/\\]react[/\\]/.test(id)
          ) {
            return "vendor";
          }
          if (id.includes("i18next")) return "i18n";
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
