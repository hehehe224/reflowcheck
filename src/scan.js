import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { inspectResponsiveLayout } from "./analyze.js";
import { renderHtmlReport } from "./report.js";

export async function scanUrl(url, options = {}) {
  const widths = options.widths ?? [320, 360, 375, 390, 412, 768, 1024, 1280, 1440];
  const height = options.height ?? 900;
  const output = path.resolve(options.output ?? "reflowcheck-report");
  const timeout = options.timeout ?? 30_000;
  const waitUntil = options.waitUntil ?? "networkidle";
  await mkdir(path.join(output, "screenshots"), { recursive: true });

  const browser = await launchBrowser();
  const results = [];
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      page.setDefaultTimeout(timeout);
      const response = await page.goto(url, { waitUntil, timeout });
      if (response && response.status() >= 400) throw new Error(`navigation returned HTTP ${response.status()} at ${width}px`);
      await page.evaluate(() => document.fonts?.ready);
      const analysis = await page.evaluate(inspectResponsiveLayout);
      const screenshotName = `width-${width}.png`;
      await page.screenshot({ path: path.join(output, "screenshots", screenshotName), fullPage: true });
      results.push({
        width,
        height,
        screenshot: `screenshots/${screenshotName}`,
        documentWidth: analysis.documentWidth,
        findings: analysis.findings
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const summary = results.reduce((total, result) => {
    for (const finding of result.findings) total[finding.severity === "error" ? "errors" : "warnings"] += 1;
    return total;
  }, { errors: 0, warnings: 0 });
  const jsonPath = path.join(output, "report.json");
  const htmlPath = path.join(output, "index.html");
  const report = {
    schemaVersion: 1,
    tool: { name: "reflowcheck", version: "0.1.0" },
    url,
    scannedAt: new Date().toISOString(),
    widths,
    viewportHeight: height,
    summary,
    results,
    limitations: [
      "Findings are heuristic and can include false positives or miss visual defects.",
      "The scan does not establish accessibility conformance or replace assistive-technology testing.",
      "Pages can vary because of animation, personalization, authentication, network state, and third-party content."
    ],
    artifacts: { html: htmlPath, json: jsonPath }
  };
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(htmlPath, renderHtmlReport(report));
  return report;
}

async function launchBrowser() {
  const attempts = [
    ["bundled Chromium", {}],
    ["Google Chrome", { channel: "chrome" }],
    ["Microsoft Edge", { channel: "msedge" }]
  ];
  const failures = [];
  for (const [label, launchOptions] of attempts) {
    try {
      return await chromium.launch({ headless: true, ...launchOptions });
    } catch (error) {
      failures.push(`${label}: ${firstLine(error.message)}`);
    }
  }
  throw new Error(`No compatible browser could be launched. Run "npx playwright install chromium" and try again.\n${failures.join("\n")}`);
}

function firstLine(value) {
  return String(value).split("\n")[0];
}
