import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { cloudflare } from "@cloudflare/vite-plugin";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf-8")) as {
  version: string;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  const e2eMock = env.VITE_E2E_MOCK === "true";

  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
      react(),
      ...(e2eMock ? [] : [cloudflare()]),
      VitePWA({
        registerType: "prompt",
        injectRegister: false,
        includeAssets: ["dumbbell-black-bg.svg", "dumbbell-transparent-bg.svg"],
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
              src: "/dumbbell-black-bg.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "/dumbbell-black-bg.svg",
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
      alias: [
        ...(e2eMock
          ? [
              {
                find: "@/contexts/AuthContext",
                replacement: path.resolve(rootDir, "src/e2e-mock/MockAuthProvider.tsx"),
              },
              {
                find: "@/services/prService",
                replacement: path.resolve(rootDir, "src/e2e-mock/mockPrService.ts"),
              },
              {
                find: "@/lib/firebase",
                replacement: path.resolve(rootDir, "src/e2e-mock/firebase.ts"),
              },
            ]
          : []),
        { find: "@", replacement: path.resolve(rootDir, "src") },
      ],
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
  };
});
