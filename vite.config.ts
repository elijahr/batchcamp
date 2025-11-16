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
      // Skip manifest validation due to network issues fetching schema from json.schemastore.org
      // The plugin receives HTML redirects instead of JSON, causing build failures
      // Manual validation: manifest must have valid manifest_version (2 or 3) and required fields
      skipManifestValidation: true,
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
