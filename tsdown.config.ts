import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/ddup.tsx",
  format: ["esm"],
  platform: "node",
  outDir: "dist",
  clean: true,
  shims: true,
  dts: false,
});
