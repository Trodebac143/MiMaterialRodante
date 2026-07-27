import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const projectRoot = import.meta.dirname;

export default defineConfig({
  base: "/MiMaterialRodante/",
  root: resolve(projectRoot, "github-pages"),
  publicDir: resolve(projectRoot, "public"),
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, "dist-github-pages"),
    emptyOutDir: true,
  },
});
