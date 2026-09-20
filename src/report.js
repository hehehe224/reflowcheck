export function renderHtmlReport(report) {
  const total = report.summary.errors + report.summary.warnings;
  const verdict = total === 0 ? "Clear at sampled widths" : `${total} finding${total === 1 ? "" : "s"} need review`;
  const widthLinks = report.results.map((result) => `<a href="#width-${result.width}" class="width-link ${result.findings.length ? "has-findings" : ""}"><span>${result.width}</span><small>${result.findings.length || "clear"}</small></a>`).join("");
  const sections = report.results.map(renderWidthSection).join("");
  const limitations = report.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ReflowCheck report — ${escapeHtml(report.url)}</title>
  <style>
    :root { color-scheme: dark; --ink:#f4eff2; --muted:#b7aab1; --surface:#121013; --raised:#1b171b; --line:#3b3036; --rose:#ff4f87; --rose-soft:#ffb0c8; --amber:#f0b65d; --green:#79d6a5; --radius:14px; }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; background:var(--surface); }
    body { margin:0; color:var(--ink); background:var(--surface); font:15px/1.55 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    ::selection { color:#130b0f; background:var(--rose-soft); }
    :focus-visible { outline:3px solid var(--rose); outline-offset:4px; }
    a { color:inherit; text-underline-offset:3px; }
    .masthead { padding:clamp(28px,5vw,72px) clamp(20px,5vw,72px) 28px; border-bottom:1px solid var(--line); }
    .masthead-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(260px,420px); gap:32px; align-items:end; }
    h1 { max-width:15ch; margin:0; font-size:clamp(38px,6vw,82px); line-height:.95; letter-spacing:-.035em; font-weight:760; }
    .verdict { color:${total === 0 ? "var(--green)" : "var(--rose-soft)"}; }
    .meta { margin:0; display:grid; gap:10px; }
    .meta div { display:grid; grid-template-columns:92px 1fr; gap:16px; border-top:1px solid var(--line); padding-top:9px; }
    dt { color:var(--muted); } dd { margin:0; overflow-wrap:anywhere; }
    .width-rail { display:grid; grid-template-columns:repeat(${Math.min(report.widths.length, 9)},minmax(76px,1fr)); gap:1px; margin-top:36px; background:var(--line); border:1px solid var(--line); overflow:auto; }
    .width-link { min-width:76px; padding:12px; text-decoration:none; background:var(--raised); transition:background .18s ease-out,color .18s ease-out; }
    .width-link:hover,.width-link:focus-visible { background:#2a2026; }
    .width-link.has-findings { box-shadow:inset 0 -3px 0 var(--rose); }
    .width-link span,.width-link small { display:block; font-variant-numeric:tabular-nums; }
    .width-link span { font:600 14px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace; }
    .width-link small { margin-top:4px; color:var(--muted); }
    main { padding:0 clamp(20px,5vw,72px) 96px; }
    .frame { scroll-margin-top:24px; padding-top:72px; }
    .frame-head { display:flex; align-items:baseline; justify-content:space-between; gap:24px; margin-bottom:18px; }
    h2 { margin:0; font-size:clamp(30px,4vw,54px); line-height:1; letter-spacing:-.03em; }
    .frame-status { color:var(--muted); font-variant-numeric:tabular-nums; }
    .frame-status.bad { color:var(--rose-soft); }
    .evidence { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(290px,.75fr); gap:24px; align-items:start; }
    .capture { margin:0; min-width:0; }
    .capture img { display:block; width:100%; max-height:760px; object-fit:contain; object-position:top; background:white; border-radius:var(--radius); box-shadow:0 22px 54px rgba(0,0,0,.32); }
    figcaption { color:var(--muted); margin-top:10px; font:13px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; }
    .findings { border-top:1px solid var(--line); }
    .finding { padding:18px 0 20px; border-bottom:1px solid var(--line); }
    .finding-top { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .kind { margin:0; font-size:16px; font-weight:700; }
    .severity { color:var(--surface); background:var(--rose-soft); border-radius:999px; padding:3px 8px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; }
    .severity.warning { background:var(--amber); }
    .message { margin:10px 0; color:#ddd2d8; }
    code { display:block; color:var(--rose-soft); font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace; overflow-wrap:anywhere; }
    .rect { margin-top:8px; color:var(--muted); font:12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; font-variant-numeric:tabular-nums; }
    .empty { margin:0; padding:22px 0; color:var(--green); border-bottom:1px solid var(--line); }
    .notes { max-width:76ch; margin-top:96px; padding-top:28px; border-top:1px solid var(--line); }
    .notes h2 { font-size:30px; }
    .notes li { margin:10px 0; color:var(--muted); }
    footer { margin-top:56px; color:var(--muted); font-size:13px; }
    @media (max-width:820px) { .masthead-grid,.evidence { grid-template-columns:1fr; } .width-rail { grid-template-columns:repeat(${report.widths.length},76px); } .capture img { max-height:560px; } }
    @media (prefers-reduced-motion:reduce) { html { scroll-behavior:auto; } * { transition:none!important; } }
  </style>
</head>
<body>
  <header class="masthead">
    <div class="masthead-grid">
      <h1>Responsive evidence. <span class="verdict">${escapeHtml(verdict)}.</span></h1>
      <dl class="meta">
        <div><dt>Target</dt><dd>${escapeHtml(report.url)}</dd></div>
        <div><dt>Scanned</dt><dd>${escapeHtml(new Date(report.scannedAt).toLocaleString("en-CA", { dateStyle:"medium", timeStyle:"short", timeZone:"UTC" }))} UTC</dd></div>
        <div><dt>Sample</dt><dd>${report.widths.length} widths · ${report.viewportHeight}px viewport height</dd></div>
        <div><dt>Summary</dt><dd>${report.summary.errors} errors · ${report.summary.warnings} warnings</dd></div>
      </dl>
    </div>
    <nav class="width-rail" aria-label="Viewport evidence">${widthLinks}</nav>
  </header>
  <main>
    ${sections}
    <section class="notes" aria-labelledby="limits-title">
      <h2 id="limits-title">What this report cannot prove</h2>
      <ul>${limitations}</ul>
    </section>
    <footer>Generated locally by ReflowCheck ${escapeHtml(report.tool.version)}. Screenshots and findings remain in this artifact directory.</footer>
  </main>
</body>
</html>`;
}

function renderWidthSection(result) {
  const count = result.findings.length;
  const findings = count === 0 ? `<p class="empty">No heuristic defects detected at this width.</p>` : result.findings.map(renderFinding).join("");
  return `<section class="frame" id="width-${result.width}" aria-labelledby="heading-${result.width}">
    <div class="frame-head">
      <h2 id="heading-${result.width}">${result.width}px</h2>
      <span class="frame-status ${count ? "bad" : ""}">${count ? `${count} finding${count === 1 ? "" : "s"}` : "clear"}</span>
    </div>
    <div class="evidence">
      <figure class="capture"><img src="${escapeHtml(result.screenshot)}" alt="Full-page capture at ${result.width} pixels wide" loading="lazy"><figcaption>document ${result.documentWidth}px · viewport ${result.width}×${result.height}px</figcaption></figure>
      <div class="findings" aria-label="Findings at ${result.width} pixels">${findings}</div>
    </div>
  </section>`;
}

function renderFinding(finding) {
  const rect = finding.rect;
  return `<article class="finding">
    <div class="finding-top"><h3 class="kind">${escapeHtml(humanize(finding.kind))}</h3><span class="severity ${finding.severity}">${escapeHtml(finding.severity)}</span></div>
    <p class="message">${escapeHtml(finding.message)}</p>
    <code>${escapeHtml(finding.selector)}</code>
    <div class="rect">x ${rect.x} · y ${rect.y} · w ${rect.width} · h ${rect.height}</div>
  </article>`;
}

function humanize(value) {
  return value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
}
