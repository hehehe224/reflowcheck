# ReflowCheck

**Find responsive layout defects without maintaining screenshot baselines.**

ReflowCheck opens a page at a deliberate matrix of viewport widths, looks for observable layout failures, and writes a portable evidence report. Each finding includes the affected width, selector, geometry, screenshot, and a plain-language explanation.

It is designed for the awkward class of bug that lives between breakpoints: horizontal overflow, clipped text, and controls hidden beneath unrelated elements.

> ReflowCheck is a heuristic defect finder. It is not an accessibility certification tool and it does not prove that a page is visually correct.

## Why this exists

Screenshot-diff tools are excellent when a team already has trusted baselines. They are less helpful when a page is new, the baseline is already broken, or the failure only appears at an untested width.

ReflowCheck starts from observable browser geometry instead:

- no baseline images to approve;
- no hosted account, telemetry, or API key;
- useful artifacts on the first run;
- explicit false-positive controls for intentional scrollers, ellipsis, and decorative overflow;
- deterministic exit codes for local scripts and CI.

## Quick start

ReflowCheck currently requires Node.js 20 or newer.

```bash
git clone https://github.com/hehehe224/reflowcheck.git
cd reflowcheck
npm install
npx playwright install chromium
node bin/reflowcheck.js https://example.com
```

Open `reflowcheck-report/index.html` to inspect the evidence contact sheet. The same directory contains `report.json` and one full-page screenshot per sampled width.

## Usage

```text
reflowcheck <url> [options]

--widths LIST        comma-separated viewport widths
--height PX          viewport height from 320 to 2160
-o, --output DIR     artifact directory
--format text|json   terminal output format
--fail-on LEVEL      error, warning, or never
--wait-until EVENT   load, domcontentloaded, or networkidle
--timeout MS         navigation timeout
-h, --help           show help
-v, --version        show version
```

The default width matrix is `320,360,375,390,412,768,1024,1280,1440`.

### Examples

Scan only the widths around a suspect breakpoint:

```bash
node bin/reflowcheck.js https://example.com \
  --widths 640,720,768,820 \
  --output artifacts/reflowcheck
```

Emit machine-readable terminal output without failing the command:

```bash
node bin/reflowcheck.js https://example.com --format json --fail-on never
```

Fail CI on warnings as well as errors:

```bash
node bin/reflowcheck.js https://example.com --fail-on warning
```

Local files are supported through `file:` URLs:

```bash
node bin/reflowcheck.js "file://$PWD/dist/index.html" --wait-until load
```

## What it detects

| Finding | Severity | Evidence |
| --- | --- | --- |
| Horizontal overflow | Error | An element begins left of the viewport or extends beyond its right edge. |
| Clipped text | Warning | Text exceeds a clipped content box without intentional ellipsis. |
| Obscured control | Error | The center of an interactive control is covered by another pointer-active element. |

The scanner suppresses common intentional patterns, including horizontal carousels with `overflow-x: auto`, ellipsized labels, and pointer-inert decorative elements marked `aria-hidden`.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | The configured threshold was not reached. |
| `1` | Findings reached the `--fail-on` threshold. |
| `2` | The command, navigation, or browser setup failed. |

`--fail-on never` always returns `0` after a completed scan, while still writing every finding to the report.

## GitHub Actions

Build the site first, serve it on a predictable local port, and then run ReflowCheck against that URL. Upload the complete report directory even when the scan fails.

```yaml
- name: Install ReflowCheck browser
  run: npx playwright install --with-deps chromium

- name: Scan responsive layouts
  run: node bin/reflowcheck.js http://127.0.0.1:4173 --output artifacts/reflowcheck

- name: Upload responsive evidence
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: reflowcheck-report
    path: artifacts/reflowcheck
```

## Report format

`report.json` uses a versioned top-level schema:

```json
{
  "schemaVersion": 1,
  "url": "https://example.com/",
  "summary": { "errors": 1, "warnings": 0 },
  "results": [
    {
      "width": 390,
      "height": 900,
      "findings": [
        {
          "kind": "horizontal-overflow",
          "severity": "error",
          "selector": "main > section.pricing",
          "message": "Element extends 24px beyond the right edge.",
          "rect": { "x": 0, "y": 440, "width": 414, "height": 280 }
        }
      ]
    }
  ]
}
```

Consumers should check `schemaVersion` before relying on field shapes.

## Limitations

- Findings are heuristics and can include false positives or miss visual defects.
- Pages can vary because of animation, personalization, authentication, network state, and third-party content.
- A viewport sample cannot cover every possible width, zoom level, browser engine, or user preference.
- The scanner does not replace keyboard, screen-reader, contrast, or assistive-technology testing.
- Authentication setup and scripted user journeys are not part of the first release.

If the page intentionally uses an unusual overflow pattern, open an issue with a minimal reproduction that contains no private content.

## Development

```bash
npm install
npx playwright install chromium
npm run check
npm test
npm run test:integration
npm pack --dry-run
```

The integration suite contains both seeded defects and intentional-overflow counterexamples. A detector change is not complete unless both sides still pass.

## Security and privacy

ReflowCheck runs locally and does not upload scanned content. Reports can still contain sensitive page text, URLs, selectors, and screenshots; treat the artifact directory accordingly. Only scan pages you are authorized to access.

Report vulnerabilities through GitHub private vulnerability reporting. See [SECURITY.md](SECURITY.md).

## License

The source code is licensed under `AGPL-3.0-only`. The ReflowCheck name and original artwork are reserved; see [TRADEMARKS.md](TRADEMARKS.md).
