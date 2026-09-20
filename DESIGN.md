---
name: ReflowCheck
description: A forensic contact sheet for responsive layout evidence.
colors:
  inspection-black: "#121013"
  raised-black: "#1b171b"
  evidence-white: "#f4eff2"
  muted-mauve: "#b7aab1"
  rule-plum: "#3b3036"
  annotation-rose: "#ff4f87"
  soft-rose: "#ffb0c8"
  uncertainty-amber: "#f0b65d"
  clear-green: "#79d6a5"
typography:
  display:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(38px, 6vw, 82px)"
    fontWeight: 760
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  body:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  evidence-label:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  evidence: "14px"
  status: "999px"
spacing:
  compact: "10px"
  finding: "18px"
  gutter: "clamp(20px, 5vw, 72px)"
  section: "72px"
components:
  evidence-frame:
    backgroundColor: "#ffffff"
    rounded: "{rounded.evidence}"
  status-error:
    backgroundColor: "{colors.soft-rose}"
    textColor: "{colors.inspection-black}"
    rounded: "{rounded.status}"
  status-warning:
    backgroundColor: "{colors.uncertainty-amber}"
    textColor: "{colors.inspection-black}"
    rounded: "{rounded.status}"
---

# Design System: ReflowCheck

## Overview

**Creative North Star: "The Forensic Contact Sheet"**

ReflowCheck treats each viewport capture as evidence laid out on an inspection table. The interface is dense enough for technical review but never resembles a generic analytics dashboard or a novelty terminal. Screenshots carry the visual weight; typography, rules, and restrained annotation color organize the investigation around them.

The mood is quiet, precise, and documentary. Rose marks actionable defects, amber marks uncertainty, and green appears only when the scanner has nothing to flag at a sampled width.

**Key Characteristics:**

- near-black inspection surfaces with warm-white evidence;
- large editorial verdict typography;
- narrow rules and tabular metadata;
- screenshots paired directly with selector and geometry evidence;
- motion limited to focus and navigation feedback.

## Colors

The palette is deliberately narrow so captured pages remain the loudest objects in the report.

### Primary

- **Annotation Rose** (`#ff4f87`): active defects, width markers, focus, and selected evidence.
- **Soft Rose** (`#ffb0c8`): readable error labels and verdict text on dark surfaces.

### Secondary

- **Uncertainty Amber** (`#f0b65d`): warnings that require human judgment.
- **Clear Green** (`#79d6a5`): widths with no detected heuristic defects.

### Neutral

- **Inspection Black** (`#121013`): page background and status-label ink.
- **Raised Black** (`#1b171b`): navigation cells and subtly separated surfaces.
- **Evidence White** (`#f4eff2`): primary copy and headings.
- **Muted Mauve** (`#b7aab1`): metadata, captions, limitations, and secondary copy.
- **Rule Plum** (`#3b3036`): borders and section dividers.

**The Annotation Rule.** Rose identifies a defect or an active inspection state. It is not decorative atmosphere.

## Typography

**Display Font:** system sans-serif stack
**Body Font:** system sans-serif stack
**Label/Mono Font:** system monospace stack

**Character:** The system uses native, dependency-free typography so archived reports remain portable. Large compact headlines provide editorial authority; monospace is reserved for evidence that benefits from fixed-width scanning.

### Hierarchy

- **Display** (760, `clamp(38px, 6vw, 82px)`, `0.95`): report verdict only.
- **Headline** (700+, `clamp(30px, 4vw, 54px)`, `1`): viewport widths and major report sections.
- **Title** (700, `16px`): finding kinds.
- **Body** (400, `15px`, `1.55`): explanations and limitations, capped near `76ch` for long-form notes.
- **Evidence label** (400–600, `12–14px`): selectors, rectangles, captions, and width ticks.

**The Evidence Type Rule.** Use monospace for values a developer may copy or compare, never as a theme applied to ordinary prose.

## Layout

The report is a vertically ordered contact sheet. A masthead combines the verdict and scan metadata, followed by a width rail that jumps to each frame. Every frame uses a wide screenshot column and a narrow findings column at desktop sizes. Below `820px`, the evidence becomes a single column with findings immediately after their screenshot.

Outer gutters use `clamp(20px, 5vw, 72px)`. Major frames begin every `72px`; internal finding groups use an 18–20px rhythm. The width rail may scroll horizontally when the full sample does not fit.

## Elevation & Depth

The system is flat by default. Tonal layering and one-pixel rules create structure. The only pronounced shadow belongs to a screenshot, reinforcing that the captured page is a physical evidence sheet placed above the inspection surface.

- **Evidence lift** (`0 22px 54px rgba(0,0,0,.32)`): full-page captures only.

**The Evidence-Only Shadow Rule.** Interface chrome remains flat; shadows never turn metadata or findings into floating cards.

## Shapes

Screenshots use a restrained `14px` radius to separate foreign page content from the report. Status labels use a pill shape because they are compact categorical stamps. Navigation and finding regions remain rectangular and rule-bound.

## Components

### Width Rail

Each cell shows a viewport width and either a finding count or “clear.” A rose inset rule marks widths with findings. Hover and keyboard focus deepen the tonal surface without moving layout.

### Evidence Frame

A viewport heading and count precede a two-column screenshot/findings composition. The screenshot uses `object-fit: contain` and stays aligned to its top edge so the captured page remains legible without cropping.

### Finding

Each finding combines kind, severity, explanation, selector, and rectangle. Findings are divided by narrow rules rather than nested cards. Error and warning stamps use soft rose and amber respectively.

### Focus

Keyboard focus uses a 3px Annotation Rose outline with a 4px offset. Smooth scrolling is disabled when `prefers-reduced-motion` is active.

## Do's and Don'ts

### Do:

- **Do** let screenshots dominate the evidence hierarchy.
- **Do** keep every finding attached to a width, selector, geometry, and explanation.
- **Do** use rose, amber, and green semantically and sparingly.
- **Do** preserve portability with system fonts and a self-contained report.

### Don't:

- **Don't** turn findings into a wall of interchangeable dashboard cards.
- **Don't** use decorative gradients, neon glows, fake terminal chrome, or ambient rose haze.
- **Don't** imply that a clear sampled width proves accessibility or complete visual correctness.
- **Don't** hide technical evidence behind hover-only interactions.
