import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outdir = resolve(root, "dist");

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

await build({
  entryPoints: {
    background: resolve(root, "src/background.ts"),
    content: resolve(root, "src/content.ts"),
    popup: resolve(root, "src/popup.ts")
  },
  bundle: true,
  minify: true,
  sourcemap: false,
  target: "chrome120",
  format: "iife",
  outdir,
  entryNames: "[name]"
});

await cp(resolve(root, "public"), outdir, { recursive: true });
console.log(`Built extension in ${outdir}`);
