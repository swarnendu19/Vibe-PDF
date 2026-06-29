# DESIGN_SYSTEM.md — Enterprise Grid & Spacing Specification

This document details the mathematical design tokens, margins, gutters, and spacing scale definitions for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to define the spacing and grid system for document layouts. It ensures that the Layout Agent and Page Layout Engine position elements using a consistent, mathematically structured system.

---

## 2. Goals
* Standardize page margins, gutters, and columns for Portrait and Landscape orientations.
* Enforce a baseline spacing scale based on a 4-pixel base.
* Provide absolute points (`pt`) measurements for print compatibility.
* Ensure all elements align to the vertical baseline grid.

---

## 3. Non-Goals
* **No Type Scale Details**: Does not define specific font pairings or heading hierarchies (delegated to [TYPOGRAPHY.md](file:///.agent/TYPOGRAPHY.md)).
* **No Theme Definitions**: Leaves color schemes to [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md).

---

## 4. Architecture
The layout uses a multi-layered grid framework:

```
  Letter Canvas (8.5" x 11.0" / 612pt x 792pt)
  +───────────────────────────────────────────────────────+
  │ Top Margin (63pt)                                     │
  │  +─────────────────────────────────────────────────+  │
  │  │ Column 1 │ Column 2 │ Gutter (12pt) │ ...       │  │
  │  │          │          │               │           │  │
  │  │          │          │               │           │  │
  │  │          │          │               │           │  │
  │  +─────────────────────────────────────────────────+  │
  │ Bottom Margin (72pt)                                  │
  +───────────────────────────────────────────────────────+
```

---

## 5. Responsibilities
* **Grid Enforcement**: Restricts element placements to designated columns.
* **Vertical Alignment**: Aligns text baselines across columns.
* **Print Safety**: Verifies that content remains within the safe printable zone (`0.25 in` inside margins).

---

## 6. Dependencies
* **Layout Calculations**: Relies on [PAGE_LAYOUT_ENGINE.md](file:///.agent/PAGE_LAYOUT_ENGINE.md) for height calculations.
* **Component Specs**: Integrates with [COMPONENT_LIBRARY.md](file:///.agent/COMPONENT_LIBRARY.md) for component dimensions.

---

## 7. Constraints
* **Baseline Grid Unit**: Spacing and margins must be multiples of the `4pt` baseline unit.
* **Locked Margins**:
  * Portrait: Left/Right `0.75 in` (54pt), Top `0.875 in` (63pt), Bottom `1.0 in` (72pt).
  * Landscape: Left/Right `1.0 in` (72pt), Top `0.75 in` (54pt), Bottom `0.875 in` (63pt).

---

## 8. Naming Conventions

### Spacing Tokens
* `xs`: `4px` (3pt)
* `sm`: `8px` (6pt)
* `md`: `16px` (12pt)
* `lg`: `24px` (18pt)
* `xl`: `32px` (24pt)
* `2xl`: `48px` (36pt)
* `3xl`: `64px` (48pt)

---

## 9. Folder Structure
* Design tokens inside the codebase map to:
  * `/apps/layout_sandbox/src/styles/variables.css` (CSS variables and utility classes).

---

## 10. Design Decisions

### Choosing Points (`pt`) as the Core Layout Unit
* **Decision**: We define all CSS variables for the print sandbox using points (`pt`) instead of pixels (`px`) or relative units (`rem`).
* **Rationale**: Points map directly to print dimensions ($1\text{ pt} = 1/72\text{ in}$). This ensures that the page compiles with exact dimensions regardless of screen resolution or browser scale settings.

---

## 11. Future Extensibility
* **Alternate Screen Sizes**: The layout engine can support custom print profiles (e.g. postcard sizing or pocket book sizes) by updating the spacing variable scale without rewriting the grid engine.

---

## 12. Implementation Guidance
* Map all spacing variables to CSS custom properties.
* Use CSS grids for column setups and block margins.

---

## 13. Acceptance Criteria
* The layout app compiles without errors.
* Gutters and margins align to the specified dimensions.
* Running layout tests verifies that element coordinates are multiples of `4pt`.

---

## 14. Common Mistakes
* **Relative Spacing**: Using `rem` or `em` units for page margins, which scales text unpredictably in headless browsers.
* **Grid Overrides**: Hardcoding pixel margins inside components.

---

## 15. Examples

### Core Spacing Variables in CSS
```css
:root {
  --grid-baseline: 4pt;
  
  --spacing-xs: 3pt;
  --spacing-sm: 6pt;
  --spacing-md: 12pt;
  --spacing-lg: 18pt;
  --spacing-xl: 24pt;
  --spacing-2xl: 36pt;
  --spacing-3xl: 48pt;
  
  --margin-portrait-top: 63pt;
  --margin-portrait-bottom: 72pt;
  --margin-portrait-outer: 54pt;
}
```

---

## 16. Decision Records

### ADR-006: 12-Column Portrait Grid
* **Status**: Approved.
* **Context**: We need a layout structure that is flexible enough to handle both single-column narratives and multi-column comparison layouts.
* **Decision**: Implement a 12-column grid system for portrait layouts.
* **Consequence**: Allows elements to span 3, 4, 6, or 12 columns, enabling diverse page layouts.

---

## 17. References to Related Files
* See [DESIGN_PRINCIPLES.md](file:///.agent/DESIGN_PRINCIPLES.md) for grid composition rules.
* See [TYPOGRAPHY.md](file:///.agent/TYPOGRAPHY.md) for text styles.
* See [COMPONENT_LIBRARY.md](file:///.agent/COMPONENT_LIBRARY.md) for block definitions.
