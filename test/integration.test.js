import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scanUrl } from "../src/scan.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const enabled = process.env.REFLOWCHECK_INTEGRATION === "1";

test("detects seeded defects and writes a portable report", { skip: !enabled }, async () => {
  const output = await mkdtemp(path.join(tmpdir(), "reflowcheck-broken-"));
  const report = await scanUrl(pathToFileURL(path.join(here, "fixtures", "broken.html")).href, { widths:[320], height:600, output, waitUntil:"load" });
  const kinds = new Set(report.results[0].findings.map((finding) => finding.kind));
  assert.ok(kinds.has("horizontal-overflow"));
  assert.ok(kinds.has("clipped-text"));
  assert.ok(kinds.has("obscured-control"));
  assert.match(await readFile(path.join(output, "index.html"), "utf8"), /Responsive evidence/);
});

test("ignores intentional scrollers, ellipsis, and decorative overflow", { skip: !enabled }, async () => {
  const output = await mkdtemp(path.join(tmpdir(), "reflowcheck-intentional-"));
  const report = await scanUrl(pathToFileURL(path.join(here, "fixtures", "intentional.html")).href, { widths:[320], height:600, output, waitUntil:"load" });
  assert.equal(report.results[0].findings.length, 0);
});
