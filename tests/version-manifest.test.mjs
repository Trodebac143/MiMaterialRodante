import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("GitHub Pages publica la misma versión que muestra la aplicación", () => {
  const packageVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
  const visibleVersion = packageVersion.endsWith(".0") ? packageVersion.slice(0, -2) : packageVersion;
  const source = readFileSync("app/page.tsx", "utf8");
  const manifest = JSON.parse(readFileSync("public/version.json", "utf8"));
  const deployedManifest = JSON.parse(readFileSync("dist-github-pages/version.json", "utf8"));

  assert.match(visibleVersion, /^\d+\.\d+(?:\.\d+)?$/);
  assert.match(source, new RegExp(`const APP_VERSION = "${visibleVersion.replaceAll(".", "\\.")}"`));
  assert.equal(manifest.version, visibleVersion);
  assert.equal(deployedManifest.version, visibleVersion);
});
