import assert from "node:assert/strict";
import test from "node:test";
import { readFile, stat } from "node:fs/promises";

test("the production build contains a portable GitHub Pages entry point", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(html, /YOUR FRIENDLY/);
  assert.match(html, /\.\/assets\/[^\"']+\.js/);
  assert.doesNotMatch(html, /(?:src|href)=["']\/assets\//);
  await stat(new URL("../dist/favicon.svg", import.meta.url));
});
