# PRODUCT_VISION.md — Product Vision & Strategy Specification

This document details the product strategy, design philosophy, feature scope, and user interaction limits for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to define the product requirements and quality standards for Version 1. It outlines the core philosophy of automated, print-ready document generation and sets clear boundaries for user interactions with the visual editor.

---

## 2. Goals
* Output high-fidelity, professionally styled PDFs from a single prompt.
* Guarantee that document layouts are equivalent to hand-crafted editorial brochures (e.g. Stripe Docs, Linear Guides, Canva Presentations).
* Enforce page isolation, preventing layout cascades across adjacent pages during text edits.
* Define a simplified canvas editor that protects the underlying grid from visual mistakes.

---

## 3. Non-Goals
* **No Word Processor Capabilities**: We are not building a rich-text document creator like Microsoft Word or Google Docs.
* **No Manual Layout Modification**: Users cannot drag elements, resize margins, or modify layouts at a pixel level.
* **No Web-Oriented Outputs in V1**: We will not support output targets like HTML websites, EPUB files, or raw Markdown exports in this release.

---

## 4. Architecture
The visual output of the product is governed by three primary concepts:

```
                  ┌──────────────────────────────┐
                  │    Target Content Intent     │
                  │   (Ebook, Brief, Playbook)   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │  Aesthetic Style Profile     │
                  │ (Nordic Crisp, Warm, etc.)   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │   Isolated Page-AST Nodes    │
                  │ (Elements locked to grid)    │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │   Canvas Editor Workspace    │
                  │   (Bounded Reflow Sandbox)   │
                  └──────────────────────────────┘
```

---

## 5. Responsibilities
* **Visual Standards**: Enforces design rules, typography hierarchies, and color mapping constraints.
* **Layout Isolation**: Directs the editor interface to keep all text changes and element updates within single-page boundaries.
* **Component Selection**: Coordinates which content blocks (TOC, quotes, callouts) are selected for different document intents.

---

## 6. Dependencies
* **Layout Calibration**: Integrates with [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) and [DESIGN_PRINCIPLES.md](file:///.agent/DESIGN_PRINCIPLES.md) to define grid systems.
* **Typographic Rules**: Relies on [TYPOGRAPHY.md](file:///.agent/TYPOGRAPHY.md) and [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md) for styling profiles.

---

## 7. Constraints
* **V1 Format Limit**: The only allowed output format is a PDF binary.
* **Grid Lock**: All elements must align to the active grid. Any styling modifications outside of this system are blocked by the UI.
* **Whitespace Minimum**: Every standard page must preserve at least 25% of its area as whitespace to maintain clean layouts.

---

## 8. Naming Conventions

### Product Themes
* **Modern Technical**: `nordic_crisp`
* **Warm Editorial**: `warm_editorial`
* **Sleek Dark**: `sleek_dark`

### Document Layout Intents
* **Internal Guidelines**: `playbook`
* **Performance Analysis**: `report`
* **Technical Docs**: `technical_docs`
* **Marketing Case Study**: `case_study`

---

## 9. Folder Structure
* Visual requirements inside the codebase map to:
  * `/apps/canvas_editor/src/components/` (holds the Canvas UI blocks).
  * `/apps/layout_sandbox/src/themes/` (holds the theme CSS properties).

---

## 10. Design Decisions

### Enforced Grid Alignment
* **Decision**: We lock page elements to a strict column-grid, preventing free-form manual movement.
* **Rationale**: Giving users pixel-level control often leads to misaligned elements and poor spacing. Locking placements ensures the final document looks clean and professional.

### Scoped Page Reflow
* **Decision**: Editing page 3 must not affect pages 4 through 50.
* **Rationale**: Traditional document editors suffer from layout shifts when edits on one page push content onto the next. By isolating page ASTs, editing page 3 only regenerates page 3, preserving the layout of the rest of the document.

---

## 11. Future Extensibility
* **New Layout Formats**: The Page AST is agnostic of page dimensions. In future versions, custom page dimensions (e.g. social banners or presentation slides) can be supported by updating the CSS variables without rewriting the core layout logic.

---

## 12. Implementation Guidance
* Ensure the Canvas UI wraps every element in an inline content-editable block that validates text length against page boundaries.
* Block any attempt to introduce resizing handles or custom pixel positioning controls in the editor interface.

---

## 13. Acceptance Criteria
* PDF compiles maintain the selected theme's visual profile.
* Editing page content does not cause text to overflow the footer or shift pages.
* The Canvas Editor prevents users from choosing arbitrary font sizes or margins.

---

## 14. Common Mistakes
* **Feature Creep**: Trying to add custom layout modification tools to the V1 Canvas interface.
* **Loose Bounds Checking**: Allowing text updates to overflow margins before checking page height constraints.

---

## 15. Examples

### Scoped Page Edit Action Log
```json
{
  "document_id": "doc_8829a",
  "action": "UPDATE_PAGE_TEXT",
  "payload": {
    "page_id": "page_3",
    "element_id": "elem_para_02",
    "updated_text": "This updated paragraph remains within the page 3 text budget and will not push subsequent sections."
  }
}
```

---

## 16. Decision Records

### ADR-002: Limited User Customization
* **Status**: Approved.
* **Context**: We want to make sure generated PDFs maintain the quality of high-end editorial designs.
* **Decision**: Restrict the Canvas Editor to six options: edit text, swap themes, reorder pages, duplicate pages, delete pages, and regenerate pages.
* **Consequence**: Keeps the UI simple and ensures the final document output is clean and consistent.

---

## 17. References to Related Files
* See [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for grid and margin rules.
* See [CANVAS_EDITOR.md](file:///.agent/CANVAS_EDITOR.md) for editor specifications and interactions.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for verification criteria.
