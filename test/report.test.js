import test from "node:test";
import assert from "node:assert/strict";
import { renderHtmlReport } from "../src/report.js";

test("escapes untrusted page metadata in the HTML report", () => {
  const html = renderHtmlReport({
    url: "https://example.com/?q=<script>alert(1)</script>",
    scannedAt: "2026-09-21T00:00:00.000Z",
    widths: [320],
    viewportHeight: 900,
    summary: { errors: 1, warnings: 0 },
    results: [{
      width: 320,
      height: 900,
      screenshot: "screenshots/width-320.png",
      documentWidth: 500,
      findings: [{ kind: "horizontal-overflow", severity: "error", selector: "img[x='<bad>']", message: "<bad>", rect: { x:0,y:0,width:500,height:20 } }]
    }],
    limitations: ["heuristic"],
    tool: { version: "0.1.0" }
  });
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /img\[x=&#39;&lt;bad&gt;&#39;\]/);
});
