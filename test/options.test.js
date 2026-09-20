import test from "node:test";
import assert from "node:assert/strict";
import { normalizeWidths, parseArgs, shouldFail } from "../src/options.js";

test("normalizes, sorts, and deduplicates widths", () => {
  assert.deepEqual(normalizeWidths("768, 320,390,320"), [320, 390, 768]);
});

test("rejects implausible viewport widths", () => {
  assert.throws(() => normalizeWidths("120,390"), /between 240 and 3840/);
});

test("parses a complete scan command", () => {
  assert.deepEqual(parseArgs(["https://example.com", "--widths", "320,768", "--height", "800", "--fail-on", "warning"]), {
    url: "https://example.com/",
    widths: [320, 768],
    height: 800,
    output: "reflowcheck-report",
    format: "text",
    failOn: "warning",
    waitUntil: "networkidle",
    timeout: 30000
  });
});

test("rejects unknown options and unsafe URL schemes", () => {
  assert.throws(() => parseArgs(["https://example.com", "--wat"]), /unknown option/);
  assert.throws(() => parseArgs(["javascript:alert(1)"]), /http, https, or file/);
});

test("applies each fail-on threshold", () => {
  assert.equal(shouldFail({ errors: 1, warnings: 0 }, "error"), true);
  assert.equal(shouldFail({ errors: 0, warnings: 1 }, "error"), false);
  assert.equal(shouldFail({ errors: 0, warnings: 1 }, "warning"), true);
  assert.equal(shouldFail({ errors: 1, warnings: 1 }, "never"), false);
});
