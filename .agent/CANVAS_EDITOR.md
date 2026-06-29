# CANVAS_EDITOR.md — Minimal Interactive Canvas Architecture

This document specifies the canvas editor interface, user interaction limits, re-rendering processes, and rollback protocols.

---

## 1. Purpose
The purpose of this document is to define the boundaries and behaviors of the Canvas Editor. It ensures that the user interface prevents pixel-level modifications, keeps edits isolated to single-page boundaries, and supports simple document updates.

---

## 2. Goals
* Design a canvas editor that blocks pixel dragging, manual resizing, and arbitrary style selections.
* Enforce page-level isolated updates to prevent layout shifts.
* Support six key operations: edit text, swap themes, reorder pages, duplicate pages, delete pages, and regenerate pages.
* Implement rollback states to support undo/redo actions.

---

## 3. Non-Goals
* **No WYSIWYG Editor features**: We are not building a rich-text document creator with free-form text or image overlays.
* **No Multi-device Previews in V1**: We will only support standard Letter/A4 canvas dimensions.

---

## 4. Architecture
The Canvas Editor operates as a structured react UI app communicating with the backend API:

```
  Canvas Editor React UI ──► Scoped Page Request ──► Canvas Agent Execution
             ▲                                               │
             │                                               ▼
     Re-render page DOM ◄── Validated Page AST Node ◄── Sandbox Fit Check
```

---

## 5. Responsibilities
* **Action Routing**: Maps canvas clicks to API routes.
* **Reflow Containment**: Confirms that editing text does not push content onto adjacent pages.
* **Rollback Management**: Executes undo actions using revision logs.

---

## 6. Dependencies
* **Core Runtimes**: React/Vite systems defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **API endpoints**: Coordinates with routes defined in [API_SPEC.md](file:///.agent/API_SPEC.md).

---

## 7. Constraints
* **No Pixel Placement**: Elements must align to the active grid and cannot be positioned at custom $(x, y)$ coordinates.
* **Page-Level Edits**: Updates to page $N$ are prohibited from changing content on adjacent pages.
* **Height Limit Check**: Modifications that cause a page's content height to exceed limits must be blocked by the UI.

---

## 8. Naming Conventions

### Actions
* Interaction Actions: `EDIT_TEXT`, `SWAP_THEME`, `REORDER_PAGES`, `DUPLICATE_PAGE`, `DELETE_PAGE`, `REGENERATE_PAGE`.

---

## 9. Folder Structure
* Canvas Editor code maps to:
  * `/apps/canvas_editor/src/components/` (contains editor UI components).
  * `/apps/canvas_editor/src/hooks/useCanvasActions.ts` (contains action handlers).

---

## 10. Design Decisions

### No-Pixel-Edit Constraints
* **Decision**: We block direct element movement, resizing handles, and style modification tools.
* **Rationale**: Giving users pixel-level control can lead to misaligned elements and poor spacing. Restricting updates to high-level actions ensures the final document maintains a clean design.

---

## 11. Future Extensibility
* **Collaborative Canvas**: The editor can be expanded to support real-time collaboration (e.g. Yjs or Automerge) by synchronizing AST state transitions without changing component structures.

---

## 12. Implementation Guidance
* Build the editor page layout as cards on a canvas grid.
* Use standard input text areas that update the AST state upon exit.

---

## 13. Acceptance Criteria
* The canvas editor compiles and supports all six actions.
* Inline text edits are blocked if they cause page overflows.
* Undo actions restore the page to its pre-update state.

---

## 14. Common Mistakes
* **Global Reflow Cascade**: Allowing changes on page 3 to push content onto page 4, which breaks layouts.
* **Missing Height Validation**: Saving text edits before verifying that the content fits page height limits.

---

## 15. Examples

### Scoped Page Edit Request Payload
* **Endpoint**: `POST /api/v1/documents/doc_8829a/pages/page_3/edit`
* **Request Body**:
```json
{
  "user_command": "Convert the middle paragraph into a vertical timeline infographic."
}
```
* **Response**: Returns the updated Page AST node.
```json
{
  "page_id": "page_3",
  "page_number": 3,
  "layout_variant": "standard_editorial",
  "elements": [
    {
      "id": "elem_timeline_02",
      "type": "timeline",
      "content": {
        "milestones": [
          { "date": "Q1", "title": "Configure Gateway", "description": "Set paths." }
        ]
      }
    }
  ]
}
```

---

## 16. Decision Records

### ADR-021: Inline Content-Editable Blocks
* **Status**: Approved.
* **Context**: Popup forms for editing text can feel clunky and slow down updates.
* **Decision**: Use inline content-editable divs with baseline constraints for text edits.
* **Consequence**: Improves user experience while keeping text aligned to the grid.

---

## 17. References to Related Files
* See [PRODUCT_VISION.md](file:///.agent/PRODUCT_VISION.md) for strategy details.
* See [API_SPEC.md](file:///.agent/API_SPEC.md) for endpoint details.
* See [DOCUMENT_MEMORY.md](file:///.agent/DOCUMENT_MEMORY.md) for version logs.
