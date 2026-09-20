# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: Node.js CLI with Playwright for browser automation and a self-contained HTML report for review and CI artifacts.

## Users

Frontend developers, agencies, QA engineers, and teams reviewing AI-generated interfaces before release. They need to locate responsive defects that appear only at particular viewport widths without first authoring screenshot baselines.

## Product Purpose

ReflowCheck scans a page across a deliberate width matrix, detects actionable layout defects, and produces evidence showing the exact width and element involved. Success means a developer can move from “mobile looks broken” to a reproducible selector, screenshot, and explanation in one command.

## Positioning

Baseline-free responsive defect discovery: it searches for observable overflow, clipped text, and obscured controls instead of comparing screenshots against pre-approved images.

## Operating Context

The tool runs locally or in CI against a URL. Developers review a terminal summary, JSON, and a portable HTML report with per-width screenshots and element evidence.

## Capabilities and Constraints

- Read-only page inspection through Playwright.
- Reports horizontal overflow, clipped text, and controls obscured by unrelated elements.
- Attempts to ignore deliberate horizontal scrollers, decorative off-canvas elements, and text ellipsis.
- Produces screenshots, JSON, HTML, and a meaningful CI exit status.
- Findings are heuristics and must never be presented as proof that a page is accessible or defect-free.
- No hosted account, telemetry, uploaded source, or API key.

## Brand Commitments

The product name is ReflowCheck. Public presentation should be direct, technically serious, and visually compatible with Lena's dark, restrained, pink-accented GitHub identity without imitating generic neon developer-tool marketing.

## Evidence on Hand

The first release must be validated against seeded pages containing real defects and intentional-overflow counterexamples. No customer, benchmark, adoption, or accuracy claims exist and none may be fabricated.

## Product Principles

- Every finding names its evidence and a plausible next action.
- Useful on the first run with no baseline or configuration.
- False-positive controls are part of the product, not future polish.
- Local by default and honest about heuristic limits.
- Reports must remain readable as archived CI artifacts.

## Accessibility & Inclusion

The report must be keyboard navigable, use semantic structure, preserve 4.5:1 body-text contrast, and remain legible at narrow widths and increased text zoom.
