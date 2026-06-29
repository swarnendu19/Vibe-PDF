# COMPONENT_LIBRARY.md — Modular Content Block Specifications

This document defines the structural, spacing, and styling rules for every reusable content block in the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the layout and styling guidelines for reusable components. It enables coding agents to construct React components that align with design tokens and the baseline grid.

---

## 2. Goals
* Provide specifications for CoverPage, TOC, CalloutBox, PullQuote, DataGrid, Timeline, and Worksheet components.
* Enforce baseline grid alignment rules for all content blocks.
* Define style variants (info, warning, danger) for callout blocks.
* Establish design constraints to prevent layout issues.

---

## 3. Non-Goals
* **No Code Implementation**: Does not contain active React code or TS exports.
* **No Database Mapping**: Leaves persistence definitions to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
Components are structured as modular React modules inside the rendering sandbox:

```
  Document Context Object (AST)
  [Page Node Elements]
       │
       ├─► <CoverPage/>   ──► Render Title, Logo, Metadata
       ├─► <TOC/>         ──► Render Chapters, dot leaders, page numbers
       ├─► <CalloutBox/>  ──► Render Icon, title, message body
       └─► <DataGrid/>    ──► Render metrics, tables
```

---

## 5. Responsibilities
* **Render Consistency**: Verifies that components use CSS variables for styles.
* **Layout Isolation**: Ensures components stay within their column allocations.
* **Typographic Mapping**: Inherits correct font classes based on the active theme.

---

## 6. Dependencies
* **Grid Spacing**: Relies on [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for padding and margins.
* **Colors and Themes**: Inherits variables defined in [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md).

---

## 7. Constraints
* **Baseline Alignment**: Component heights and margins must be multiples of `4pt`.
* **Container Bounds**: Elements must align to the active grid and are prohibited from stretching past page margins.
* **Text Budget**: Content inside blocks must be kept concise to avoid page overflow.

---

## 8. Naming Conventions

### Components
* React Components: PascalCase (e.g. `CoverPage`, `TOC`, `CalloutBox`).
* CSS classes: lowercase kebab-case (e.g. `callout-box`, `toc-row`).

---

## 9. Folder Structure
* Component modules map to:
  * `/apps/layout_sandbox/src/components/` (contains React component files).
  * `/apps/layout_sandbox/src/styles/components.css` (contains component styles).

---

## 10. Design Decisions

### Standard Component Sizing
* **Decision**: We lock component widths to column boundaries (e.g. callout spans columns 4-12, quotes span columns 1-12) instead of allowing fluid width adjustments.
* **Rationale**: Sizing components to column increments ensures consistent alignment across pages.

---

## 11. Future Extensibility
* **New Components**: Custom components (e.g., signature blocks) can be added to the registry by creating a file in `/components/` and updating the AST validation schema without modifying the main layout loop.

---

## 12. Implementation Guidance
* Map all component borders and backgrounds to CSS theme variables.
* Enforce baseline grid alignment rules for all elements inside components.

---

## 13. Acceptance Criteria
* The layout app compiles successfully.
* Component dimensions align with the grid system.
* Theme changes propagate to all elements.

---

## 14. Common Mistakes
* **Relative Margins**: Using relative units (e.g., `margin-bottom: 2em`) inside components, which breaks baseline rhythm.
* **Hardcoded Heights**: Setting fixed heights (`height: 150px`) on text containers, causing text cuts if content changes.

---

## 15. Examples

### Callout Box Styles (CSS)
```css
.callout-box {
  display: flex;
  flex-direction: row;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-left: 3pt solid var(--accent-primary);
  margin-bottom: var(--spacing-md); /* Aligns to baseline */
  border-radius: 4px;
}

.callout-icon {
  margin-right: var(--spacing-sm);
  color: var(--accent-primary);
}
```

---

## 16. Decision Records

### ADR-011: Dot Leaders for Table of Contents
* **Status**: Approved.
* **Context**: Table of Contents layouts can look messy if section titles are far from their page numbers.
* **Decision**: Use dot leaders (dotted lines) to connect titles to page numbers.
* **Consequence**: Improves readability and aligns with premium print layout standards.

---

## 17. References to Related Files
* See [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for grid and margin rules.
* See [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md) for color variables.
* See [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md) for AST elements schemas.
