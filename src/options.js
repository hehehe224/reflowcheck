const DEFAULT_WIDTHS = [320, 360, 375, 390, 412, 768, 1024, 1280, 1440];

export function normalizeWidths(value) {
  const source = Array.isArray(value) ? value : String(value).split(",");
  const widths = source.map((item) => Number.parseInt(String(item).trim(), 10));
  if (widths.length === 0 || widths.some((width) => !Number.isInteger(width) || width < 240 || width > 3840)) {
    throw new Error("widths must be comma-separated integers between 240 and 3840");
  }
  return [...new Set(widths)].sort((a, b) => a - b);
}

export function parseArgs(args) {
  const options = {
    widths: DEFAULT_WIDTHS,
    height: 900,
    output: "reflowcheck-report",
    format: "text",
    failOn: "error",
    waitUntil: "networkidle",
    timeout: 30_000
  };
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const next = () => {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      index += 1;
      return value;
    };

    if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--version" || argument === "-v") options.version = true;
    else if (argument === "--widths") options.widths = normalizeWidths(next());
    else if (argument === "--height") options.height = parseInteger(next(), "height", 320, 2160);
    else if (argument === "--output" || argument === "-o") options.output = next();
    else if (argument === "--format") options.format = parseChoice(next(), "format", ["text", "json"]);
    else if (argument === "--fail-on") options.failOn = parseChoice(next(), "fail-on", ["error", "warning", "never"]);
    else if (argument === "--wait-until") options.waitUntil = parseChoice(next(), "wait-until", ["load", "domcontentloaded", "networkidle"]);
    else if (argument === "--timeout") options.timeout = parseInteger(next(), "timeout", 1_000, 120_000);
    else if (argument.startsWith("--")) throw new Error(`unknown option ${argument}`);
    else positional.push(argument);
  }

  if (options.help || options.version) return options;
  if (positional.length !== 1) throw new Error("provide exactly one URL");
  try {
    const parsed = new URL(positional[0]);
    if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) throw new Error();
    options.url = parsed.href;
  } catch {
    throw new Error("URL must use http, https, or file");
  }
  return options;
}

export function shouldFail(summary, failOn) {
  if (failOn === "never") return false;
  if (failOn === "warning") return summary.errors > 0 || summary.warnings > 0;
  if (failOn === "error") return summary.errors > 0;
  throw new Error(`unknown fail-on level ${failOn}`);
}

function parseInteger(value, name, minimum, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be between ${minimum} and ${maximum}`);
  }
  return parsed;
}

function parseChoice(value, name, choices) {
  if (!choices.includes(value)) throw new Error(`${name} must be one of: ${choices.join(", ")}`);
  return value;
}

export function usage() {
  return `ReflowCheck — find responsive layout defects without screenshot baselines

Usage:
  reflowcheck <url> [options]

Options:
  --widths LIST        comma-separated viewport widths (default: ${DEFAULT_WIDTHS.join(",")})
  --height PX          viewport height from 320 to 2160 (default: 900)
  -o, --output DIR     artifact directory (default: reflowcheck-report)
  --format text|json   terminal output format (default: text)
  --fail-on LEVEL      error, warning, or never (default: error)
  --wait-until EVENT   load, domcontentloaded, or networkidle
  --timeout MS         navigation timeout (default: 30000)
  -h, --help           show help
  -v, --version        show version`;
}
