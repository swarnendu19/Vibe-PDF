# PAGE_LAYOUT_ENGINE.md — Intelligent Page Composition & Spacing Engine

This document details the mechanics of the Page Layout Engine. The engine is responsible for parsing the Document AST, calculating visual container footprints, managing line alignment, and resolving page overflows.

---

## 1. Purpose
The purpose of this document is to specify the layout calculation rules and page overflow prevention mechanisms. It ensures that the Page Layout Engine formats content cleanly, preventing text cuts or overflow across pages.

---

## 2. Goals
* Define physical page boundary dimensions for Letter and A4 templates.
* Establish a text height estimation algorithm.
* Provide an automated mitigation sequence for page overflows.
* Align elements to a vertical baseline grid.

---

## 3. Non-Goals
* **No PDF Rendering Code**: Does not implement Puppeteer connection hooks or PDF generation operations (delegated to [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md)).
* **No Style Definition**: Leaves specific component visual styles to [COMPONENT_LIBRARY.md](file:///.agent/COMPONENT_LIBRARY.md).

---

## 4. Architecture
The Layout Engine operates as a geometry compilation node inside the headless browser rendering sandbox:

```
  Input Document AST  ──►  Sandbox DOM Render  ──►  Height Measurement Check
                                                          │
             ┌────────────────────────────────────────────┴─────────────┐
             ▼ (Fits page)                                              ▼ (Overflows)
    Proceed to Compile PDF                                     Trigger Layout Retry Loop
                                                               1. Shrink spacing tokens
                                                               2. Adjust font size
                                                               3. Split paragraph
                                                               4. Request summary
```

---

## 5. Responsibilities
* **Page Boundary Audit**: Measures elements height to ensure they fit page limits.
* **Vertical rhythm alignment**: Aligns text baselines across columns.
* **Page Break Placement**: Handles section and chapter transitions, inserting page breaks correctly.

---

## 6. Dependencies
* **Grid Alignments**: Implements spacing rules defined in [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md).
* **Typography metrics**: Relies on scale settings defined in [TYPOGRAPHY.md](file:///.agent/TYPOGRAPHY.md).

---

## 7. Constraints
* **Vertical Space Limit**: Exactly `612pt` (for Letter Portrait) or `640pt` (for A4 Portrait) content space.
* **Single Thread Calculation**: Spacing checks must execute synchronously inside the browser rendering tab.
* **No Manual Spacing Overrides**: Spacing adjustments must map to variables defined in the design system.

---

## 8. Naming Conventions

### Spacing Variables
* Content container class: `page-container`.
* Page block wrapper class: `page-block`.

---

## 9. Folder Structure
* Layout code maps to:
  * `/apps/layout_sandbox/src/sandbox.tsx` (contains height validation and sandbox initialization logic).

---

## 10. Design Decisions

### Browser Sandbox Measurements
* **Decision**: We measure element dimensions using Chromium API calls (e.g. `getBoundingClientRect`) instead of character estimation formulas.
* **Rationale**: Accurate text heights depend on font files, letter spacing, and line wraps. Measuring heights inside a real browser tab prevents rendering mismatches.

---

## 11. Future Extensibility
* **New Layout Page Types**: Support for custom formats (e.g., postcard or landscape slides) can be added by updating the CSS boundaries in the engine without rewriting the grid checks.

---

## 12. Implementation Guidance
* Set up container variables using absolute points (`pt`) in the layout CSS.
* Write a Javascript function that measures child node heights inside the sandbox:
  ```javascript
  const pageHeight = document.getElementById('page').clientHeight;
  const elementsHeight = Array.from(document.querySelectorAll('.page-block'))
    .reduce((acc, el) => acc + el.getBoundingClientRect().height, 0);
  ```

---

## 13. Acceptance Criteria
* The layout sandbox compiles and measures DOM nodes correctly.
* Page overflows are caught before triggering PDF compile steps.
* Content elements align to the vertical baseline grid.

---

## 14. Common Mistakes
* **Loose Spacing**: Using relative margin units inside page blocks, causing calculation errors in different sizes.
* **Ignoring Margins**: Measuring only container heights without factoring in margin collapse values, which can lead to layout issues.

---

## 15. Examples

### Spacing Mitigation Loop Algorithm
```javascript
async function resolveOverflow(pageNode, targetHeight) {
  let iterations = 0;
  const maxIterations = 3;
  
  while (calculateHeight(pageNode) > targetHeight && iterations < maxIterations) {
    if (iterations === 0) {
      applySpacingTokenReduction(pageNode); // xs, sm, md reductions
    } else if (iterations === 1) {
      reduceTypographyScale(pageNode, 0.95); // 5% reduction
    } else if (iterations === 2) {
      pushLastElementToNextPage(pageNode);
    }
    iterations++;
  }
  
  if (calculateHeight(pageNode) > targetHeight) {
    throw new Error("ERR_LAYOUT_OVERFLOW_FATAL");
  }
}
```

---

## 16. Decision Records

### ADR-012: Pre-calculation Height Budget
* **Status**: Approved.
* **Context**: Multi-agent pipelines can experience delays if layout retry requests are sent repeatedly back to LLMs.
* **Decision**: Enforce a character count limit on Writer Agent outputs.
* **Consequence**: Minimizes rendering failures and speeds up document compilation times.

---

## 17. References to Related Files
* See [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for spacing variable definitions.
* See [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md) for Puppeteer printing configurations.
* See [ERROR_HANDLING.md](file:///.agent/ERROR_HANDLING.md) for layout overflow recovery options.
