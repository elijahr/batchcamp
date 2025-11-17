import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      browser: process.env.TARGET || "chrome",
      manifest: "./manifest.json",
      additionalInputs: ["src/tab/index.html"],
      // Manifest validation is enabled (requires vite-plugin-web-extension >=4.5.0)


      // skipManifestValidation: false, // (default is false; can be omitted)
    }),
    sentryVitePlugin({
      org: "batchcamp-t7u",
      project: "javascript",
    }),
  ],
  build: {
    sourcemap: true,
  },
});
