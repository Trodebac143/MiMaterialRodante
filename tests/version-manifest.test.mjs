import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("GitHub Pages publica la misma versión que muestra la aplicación", () => {
  const packageVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
  const shortVersion = packageVersion.match(/^\d+\.\d+/)?.[0];
  const source = readFileSync("app/page.tsx", "utf8");
  const manifest = JSON.parse(readFileSync("public/version.json", "utf8"));
  const deployedManifest = JSON.parse(readFileSync("dist-github-pages/version.json", "utf8"));

  assert.ok(shortVersion);
  assert.match(source, new RegExp(`const APP_VERSION = "${shortVersion.replaceAll(".", "\\.")}"`));
  assert.equal(manifest.version, shortVersion);
  assert.equal(deployedManifest.version, shortVersion);
});
