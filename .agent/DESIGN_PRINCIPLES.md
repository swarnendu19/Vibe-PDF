# DESIGN_PRINCIPLES.md — Editorial & Visual Composition Axioms

This document details the core design axioms of the AI Publishing Engine. The Layout, Consistency, and QA agents must evaluate all generated layouts against these tenets to ensure a premium, editorial feel that avoids cheap, automated design.

---

## 1. Purpose
The purpose of this document is to define the visual rules and aesthetic principles that govern document generation. It ensures that the Layout Agent and Page Layout Engine produce high-quality layouts without requiring manual designer input.

---

## 2. Goals
* Define the primary rules of visual rhythm: Active Whitespace, Asymmetry, and Visual Hierarchy.
* Establish page boundaries, preventing overlapping elements or single-line text orphans.
* Balance digital reading accessibility with physical print layout specifications.
* Guide the Layout Agent's composition calculations.

---

## 3. Non-Goals
* **No Specific Styling Tokens**: Does not define specific font sizes, line heights, or color codes (delegated to [TYPOGRAPHY.md](file:///.agent/TYPOGRAPHY.md) and [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md)).
* **No Element Interface Code**: Does not define React components or DOM nodes.

---

## 4. Architecture
The visual flow follows a strict hierarchy of alignment layers:

```
+─────────────────────────────────────────────────────────+
|               LAYOUT DESIGN HIERARCHY                   |
├─────────────────────────────────────────────────────────┤
│ 1. Active Whitespace Boundaries (Frame & Margins)       │
│ 2. Asymmetric Column Grid Grid (Layout Positioning)     │
│ 3. Optical Focal Point Anchor (Visual Weight)           │
│ 4. Baseline Alignment (Typography Rhythm)               │
+─────────────────────────────────────────────────────────+
```

---

## 5. Responsibilities
* **Visual Standards Compliance**: Audits page compositions to ensure they meet the 25% negative space target.
* **Layout Integrity Enforcement**: Checks for page boundary leaks, double margins, and alignment errors.
* **Focal Point Balance**: Directs the Layout Agent to place visual anchors (e.g. diagrams or metrics) at top/bottom locations.

---

## 6. Dependencies
* **Grid Specifications**: Implements rules defined in [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md).
* **Render Verification**: Feeds layout verification criteria directly to [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md).

---

## 7. Constraints
* **The 25% Negative Space Rule**: Standard pages must preserve a minimum of 25% area as whitespace to maintain clean designs.
* **No Half-Paragraph Splits**: Paragraphs must not be split across page boundaries; they must remain intact on a single page.
* **Contrast Limit**: Text color combinations must maintain a minimum contrast ratio of 7:1 against background colors.

---

## 8. Naming Conventions

### Layout Rules
* Layout alignment tags: `asymmetric_left`, `asymmetric_right`, `symmetrical_centered`.
* Page block positions: `anchor_top`, `anchor_bottom`.

---

## 9. Folder Structure
* Design guidelines inside the codebase map to:
  * `/apps/layout_sandbox/src/styles/` (base grid and visual hierarchy stylesheets).

---

## 10. Design Decisions

### Asymmetric Layout Structure
* **Decision**: Lock text pages to an asymmetric column structure (e.g., margins on columns 1-3, body copy in columns 4-12).
* **Rationale**: Symmetrical layouts are typical of simple word documents. Asymmetric layouts are used in premium magazines (e.g., *Monocle*) and tech documentation (e.g., Stripe) to create a clean, modern aesthetic.

---

## 11. Future Extensibility
* **New Page Types**: The visual grid is agnostic of page sizes. In future releases, custom presentation templates (e.g., 16:9 slides) can be supported by updating the aspect ratios in the layout stylesheet without changing the core alignment rules.

---

## 12. Implementation Guidance
* Run Playwright regression tests during sandbox builds to verify layout alignments.
* Ensure the layout engine measures page height and flags any element that extends past the footer margin.

---

## 13. Acceptance Criteria
* Standard pages contain at least 25% negative space.
* Headings do not appear alone at the bottom of a page.
* Page numbers and running headers align to page margins.

---

## 14. Common Mistakes
* **Padding Scars**: Adding custom margin overrides to fix overflows, which breaks the baseline grid rhythm.
* **Focal Overload**: Placing multiple callout boxes and heavy diagrams on a single page, which creates a cluttered layout.

---

## 15. Examples

### Visual Hierarchy Grid Layout
```
+-----------------------------------------+
|  [Header Metadata - Outfit, 8pt]        |
|                                         |
|  ## [Primary Heading - Inter, 20pt]     |
|                                         |
|  [Callout block - left accent border]   |
|  "Key insight highlights here"          |
|                                         |
|  Body text runs in a clean, asymmetric  |
|  column, keeping the left margin open.  |
|                                         |
|  [Footer - Page Number]                 |
+-----------------------------------------+
```

---

## 16. Decision Records

### ADR-005: Strict Page Containment
* **Status**: Approved.
* **Context**: Text overflows can cause cascading layout shifts, breaking downstream pages.
* **Decision**: Block document compilation if any element overflows page boundaries.
* **Consequence**: Forces the Layout Agent to either split sections or adjust page budgets, ensuring clean page cuts.

---

## 17. References to Related Files
* See [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for grid and margin rules.
* See [TYPOGRAPHY.md](file:///.agent/TYPOGRAPHY.md) for font specifications.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for QA checklists.
