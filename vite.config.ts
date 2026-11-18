import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Sub-path when hosted under another site, e.g. GZ_BASE=/ground-zero/ (see deploy/pubblica.sh).
  base: process.env.GZ_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { chunkSizeWarningLimit: 4000 },
});
