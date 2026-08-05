import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const releaseDir = resolve(root, "release");
const archive = resolve(releaseDir, "patternqueue-v0.6.1.zip");
const sourceArchive = resolve(releaseDir, "patternqueue-source-v0.6.1.zip");

await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });

execFileSync(process.execPath, [resolve(root, "scripts/build.mjs")], {
  cwd: root,
  stdio: "inherit"
});
execFileSync("zip", ["-qr", archive, "."], {
  cwd: resolve(root, "dist"),
  stdio: "inherit"
});
execFileSync(
  "zip",
  [
    "-qr",
    sourceArchive,
    "src",
    "public",
    "assets",
    "scripts",
    "test",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "README.md",
    "REQUIREMENTS.md",
    "LICENSE"
  ],
  {
    cwd: root,
    stdio: "inherit"
  }
);

console.log(`Packaged ${archive}`);
console.log(`Packaged ${sourceArchive}`);
