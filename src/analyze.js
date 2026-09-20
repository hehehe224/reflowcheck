export function inspectResponsiveLayout() {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const elements = [...document.querySelectorAll("body *")];
  const findings = [];

  function isVisible(element) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.01 && rect.width > 0 && rect.height > 0;
  }

  function selectorFor(element) {
    if (element.id) return `#${CSS.escape(element.id)}`;
    const testId = element.getAttribute("data-testid");
    if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
    const parts = [];
    let current = element;
    while (current && current !== document.body && parts.length < 4) {
      let part = current.localName;
      const stableClasses = [...current.classList].filter((name) => /^[a-zA-Z][\w-]{0,48}$/.test(name)).slice(0, 2);
      if (stableClasses.length) part += `.${stableClasses.map((name) => CSS.escape(name)).join(".")}`;
      const parent = current.parentElement;
      if (parent) {
        const peers = [...parent.children].filter((child) => child.localName === current.localName);
        if (peers.length > 1) part += `:nth-of-type(${peers.indexOf(current) + 1})`;
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(" > ");
  }

  function rectFor(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x * 10) / 10,
      y: Math.round(rect.y * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
      right: Math.round(rect.right * 10) / 10,
      bottom: Math.round(rect.bottom * 10) / 10
    };
  }

  function isInsideIntentionalScroller(element) {
    let current = element;
    while (current && current !== document.body) {
      const style = getComputedStyle(current);
      const overflow = style.overflowX;
      if ((overflow === "auto" || overflow === "scroll") && current.scrollWidth > current.clientWidth + 1) return true;
      current = current.parentElement;
    }
    return false;
  }

  function isDecorative(element) {
    const style = getComputedStyle(element);
    const noMeaningfulText = !element.textContent.trim();
    const noInteractiveDescendant = !element.matches("a, button, input, select, textarea, [role=button]") && !element.querySelector("a, button, input, select, textarea, [role=button]");
    return noMeaningfulText && noInteractiveDescendant && (element.getAttribute("aria-hidden") === "true" || style.pointerEvents === "none");
  }

  const overflowing = elements.filter((element) => {
    if (!isVisible(element) || isInsideIntentionalScroller(element) || isDecorative(element)) return false;
    const rect = element.getBoundingClientRect();
    return rect.right > viewportWidth + 1 || rect.left < -1;
  });

  for (const element of overflowing) {
    const rect = element.getBoundingClientRect();
    const childAlsoOverflows = [...element.children].some((child) => overflowing.includes(child));
    if (childAlsoOverflows && element.scrollWidth > element.clientWidth + 1) continue;
    findings.push({
      kind: "horizontal-overflow",
      severity: "error",
      selector: selectorFor(element),
      message: rect.left < -1
        ? `Element begins ${Math.ceil(Math.abs(rect.left))}px left of the viewport.`
        : `Element extends ${Math.ceil(rect.right - viewportWidth)}px beyond the right edge.`,
      rect: rectFor(element)
    });
  }

  for (const element of elements) {
    if (!isVisible(element) || !element.textContent.trim()) continue;
    if (element.children.length > 0 && [...element.children].some((child) => child.textContent.trim())) continue;
    const style = getComputedStyle(element);
    const clips = ["hidden", "clip"].includes(style.overflowX) || ["hidden", "clip"].includes(style.overflowY);
    const contentOverflows = element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
    const intentionalEllipsis = style.textOverflow === "ellipsis";
    if (clips && contentOverflows && !intentionalEllipsis) {
      findings.push({
        kind: "clipped-text",
        severity: "warning",
        selector: selectorFor(element),
        message: "Text is larger than its clipped content box and no ellipsis is present.",
        rect: rectFor(element)
      });
    }
  }

  const controls = elements.filter((element) => element.matches("a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], [tabindex]:not([tabindex='-1'])"));
  for (const control of controls) {
    if (!isVisible(control) || control.disabled || control.getAttribute("aria-hidden") === "true") continue;
    const rect = control.getBoundingClientRect();
    const x = Math.min(viewportWidth - 1, Math.max(0, rect.left + rect.width / 2));
    const y = Math.min(viewportHeight - 1, Math.max(0, rect.top + rect.height / 2));
    if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) continue;
    const top = document.elementFromPoint(x, y);
    if (!top || top === control || control.contains(top) || top.contains(control)) continue;
    const topStyle = getComputedStyle(top);
    if (topStyle.pointerEvents === "none" || Number(topStyle.opacity) < 0.05) continue;
    findings.push({
      kind: "obscured-control",
      severity: "error",
      selector: selectorFor(control),
      message: `The control center is covered by ${selectorFor(top)}.`,
      obstruction: selectorFor(top),
      rect: rectFor(control)
    });
  }

  const unique = new Map();
  for (const finding of findings) unique.set(`${finding.kind}:${finding.selector}`, finding);
  return {
    viewport: { width: viewportWidth, height: viewportHeight },
    documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    findings: [...unique.values()].slice(0, 100)
  };
}
