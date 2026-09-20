#!/usr/bin/env node

import { parseArgs, shouldFail, usage } from "../src/options.js";
import { scanUrl } from "../src/scan.js";

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`reflowcheck: ${error.message}\n`);
    console.error(usage());
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  if (options.version) {
    console.log("0.1.0");
    return;
  }

  try {
    const report = await scanUrl(options.url, options);
    if (options.format === "json") {
      console.log(JSON.stringify(report, null, 2));
    } else {
      const total = report.summary.errors + report.summary.warnings;
      console.log(`\nReflowCheck: ${total === 0 ? "PASS" : "ISSUES"}`);
      console.log(`Scanned ${report.url} at ${report.widths.length} widths`);
      console.log(`${report.summary.errors} errors · ${report.summary.warnings} warnings`);
      for (const result of report.results) {
        const label = result.findings.length === 0 ? "clear" : `${result.findings.length} finding${result.findings.length === 1 ? "" : "s"}`;
        console.log(`  ${String(result.width).padStart(4)}px  ${label}`);
        for (const finding of result.findings) {
          console.log(`          ${finding.severity.toUpperCase()} ${finding.kind}: ${finding.selector}`);
        }
      }
      console.log(`\nReport: ${report.artifacts.html}`);
      console.log(`JSON:   ${report.artifacts.json}`);
    }

    if (shouldFail(report.summary, options.failOn)) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`reflowcheck: ${error.message}`);
    process.exitCode = 2;
  }
}

await main();
