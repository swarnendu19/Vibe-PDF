# DOCUMENT_MODEL.md — Document AST Schema Specification

This document specifies the Abstract Syntax Tree (AST) schema representing a document within the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to define the data structures and TypeScript interfaces for the Document AST. It ensures that the Orchestration Agents and Layout Sandbox exchange data using a structured format.

---

## 2. Goals
* Provide TypeScript interfaces for documents, pages, and element nodes.
* Enforce unique identifier generation (UUIDv4) for all node types.
* Define JSON schemas for all component types (headings, paragraphs, callouts, data grids).
* Set validation rules to ensure document integrity.

---

## 3. Non-Goals
* **No Database Table Declarations**: Leaves SQL definitions to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Render System Operations**: Does not implement DOM rendering code.

---

## 4. Architecture
The Document AST acts as the intermediate representation (IR) of the system:

```
  Planner Agent  ──►  Writer Copy generation  ──►  Document AST JSON  ──►  Layout Sandbox
  Creates structure   Populates elements           Validates schema         Renders DOM
```

---

## 5. Responsibilities
* **Data Verification**: Checks that AST inputs conform to schemas.
* **Component Mapping**: Maps content nodes to their visual components.
* **Metadata Coordination**: Binds page dimensions, orientations, and theme preferences.

---

## 6. Dependencies
* **Core Runtimes**: TS compiler settings defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **Component specifications**: Coordinates directly with [COMPONENT_LIBRARY.md](file:///.agent/COMPONENT_LIBRARY.md).

---

## 7. Constraints
* **UUIDv4 Identifiers**: Every element, page, and document node must use a unique UUIDv4 string.
* **Sequential Page Numbers**: Page number properties must be consecutive integers starting at 1.
* **Schema Validation**: All AST inputs must pass schema validation checks before compilation starts.

---

## 8. Naming Conventions

### Types & Interfaces
* Type Interfaces: PascalCase (e.g. `DocumentAST`, `PageNode`, `ContentElement`).
* Enum properties: UPPERCASE (e.g. `LETTER`, `PORTRAIT`).

---

## 9. Folder Structure
* AST schemas map to:
  * `/services/orchestrator/src/database/schema.ts` (contains database model definitions).
  * `/apps/layout_sandbox/src/types/ast.ts` (contains TypeScript interfaces).

---

## 10. Design Decisions

### Abstract Syntax Tree (AST) Structure
* **Decision**: We represent the document structure using an AST (JSON format) instead of flat HTML files.
* **Rationale**: An AST separates content from styling rules. This allows agents to modify paragraphs, reorder pages, and change themes easily, and supports scoped, page-level canvas editing.

---

## 11. Future Extensibility
* **New Element Types**: Custom element types (e.g., charts) can be supported by updating the content union type schema without changing the page node structures.

---

## 12. Implementation Guidance
* Map TS interfaces to database structures.
* Run incoming payloads through JSON validation tools (e.g. `zod` schema validator) before rendering.

---

## 13. Acceptance Criteria
* The layout app compiles successfully.
* JSON schema validations block invalid node types.
* Output AST structures are serializable.

--- /

## 14. Common Mistakes
* **Duplicate IDs**: Reusing node IDs across different pages or elements, which breaks page-level canvas edits.
* **Missing Schema Versioning**: Failing to include a schema version key, which can cause backward-compatibility issues when AST schemas change.

---

## 15. Examples

### Complete AST JSON Payload
```json
{
  "id": "99a8f21e-128a-40a2-8930-74358c02800c",
  "schemaVersion": "1.0.0",
  "metadata": {
    "title": "System Architecture Case Study",
    "author": "Engineering Lead",
    "date": "2026-06-27",
    "paperSize": "LETTER",
    "orientation": "PORTRAIT"
  },
  "theme": {
    "id": "nordic_crisp",
    "typography": {
      "headingFont": "Outfit",
      "bodyFont": "Lora",
      "monospaceFont": "IBM Plex Mono"
    }
  },
  "pages": [
    {
      "id": "5658596e-26a7-4bb4-bfe4-14400af18b6f",
      "pageNumber": 1,
      "layoutVariant": "cover",
      "elements": [
        {
          "id": "883d6ca0-c82a-4394-8930-74358c02800c",
          "type": "heading",
          "content": {
            "level": 1,
            "text": "Stripe Integrations Guide"
          }
        }
      ]
    }
  ]
}
```

---

## 16. Decision Records

### ADR-014: Strict UUID Enforcements
* **Status**: Approved.
* **Context**: The Canvas Editor needs to target and update specific text blocks on user command.
* **Decision**: Require every content element to carry a unique UUIDv4 string.
* **Consequence**: Enables page-level updates without risk of targeting the wrong element.

---

## 17. References to Related Files
* See [COMPONENT_LIBRARY.md](file:///.agent/COMPONENT_LIBRARY.md) for element types definitions.
* See [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md) for database model structures.
* See [CANVAS_EDITOR.md](file:///.agent/CANVAS_EDITOR.md) for editor specifications.
