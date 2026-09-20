# Contributing

Thanks for helping make responsive defect detection more useful and less noisy.

## Before opening a change

- Search existing issues and pull requests.
- Keep each pull request focused on one detector, report behavior, or documented workflow.
- For new heuristics, include both a page that should trigger the finding and a counterexample that must remain clear.
- Never commit screenshots, URLs, tokens, or reports from private applications.

## Local checks

```bash
npm install
npx playwright install chromium
npm run check
npm test
npm run test:integration
npm pack --dry-run
```

## Detector changes

Every finding must provide a reproducible selector, geometry, severity, and explanation. Prefer browser-observable evidence over assumptions about a framework or CSS architecture.

False-positive handling belongs in the same change as a new detector. ReflowCheck should ignore deliberate horizontal scrollers, conventional ellipsis, and pointer-inert decorative overflow unless the proposed behavior explains why one of those cases is genuinely broken.

## Pull requests

Describe:

1. the visible failure or false positive;
2. the smallest page that reproduces it;
3. why the new evidence is reliable;
4. which commands you ran.

By contributing, you agree that your contribution is licensed under `AGPL-3.0-only`.
