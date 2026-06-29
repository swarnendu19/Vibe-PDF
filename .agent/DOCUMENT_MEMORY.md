# DOCUMENT_MEMORY.md — Long-Context Memory Architecture

This document defines the long-context memory hierarchies, terminology caches, asset indexes, and retrieval strategies for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the memory system for the compilation pipeline. It ensures that agents have access to consistent style profiles, terminology lists, and asset reference metrics.

---

## 2. Goals
* Design a hierarchical memory architecture (Global, Chapter, Page).
* Implement a terminology cache to prevent brand styling drift.
* Track illustration and diagram assets.
* Support undo and rollback features inside the Canvas Editor.

---

## 3. Non-Goals
* **No Database Migrations**: Leaves SQL schema migrations to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Layout Engine Operations**: Does not calculate element coordinates.

---

## 4. Architecture
The memory framework runs on three distinct levels of context:

```
  +───────────────────────────────────────────────────────────+
  │   Global Memory (Document goals, style guides, glossary)  │
  +─────────────────────────────┬─────────────────────────────+
                                ▼
  +───────────────────────────────────────────────────────────+
  │  Chapter Memory (Chapter themes, historical copy context) │
  +─────────────────────────────┬─────────────────────────────+
                                ▼
  +───────────────────────────────────────────────────────────+
  │   Page Memory (Layout offsets, coordinates, page prompts) │
  +───────────────────────────────────────────────────────────+
```

---

## 5. Responsibilities
* **Context Retrieval**: Exposes relevant style profiles and glossary lists to active agents.
* **Glossary Enforcement**: Audits text copy to ensure brand names match defined styles.
* **Revision Recording**: Logs step histories to support canvas rollbacks.

---

## 6. Dependencies
* **Core Systems**: Node.js microservices defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **AST Mappings**: Relies on definitions configured in [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md).

---

## 7. Constraints
* **Read-Only Access**: Content generation agents must treat Global Memory as read-only.
* **Unique UUID References**: Every asset entry must be linked to a page ID using a unique UUID v4 reference.
* **Write Transaction Log**: Updates to the canvas must write to the version log table before updating active records.

---

## 8. Naming Conventions

### Memory Tables
* Table references: `documents`, `revisions`, `assets`.
* Memory key tags: `global_memory`, `chapter_memory`, `page_memory`.

---

## 9. Folder Structure
* Memory logic maps to:
  * `/services/orchestrator/src/database/queries/` (contains memory retrieval functions).
  * `/services/orchestrator/src/database/schema.sql` (contains memory table schemas).

---

## 10. Design Decisions

### Decoupling Memory into Tiers
* **Decision**: We partition memory into Global, Chapter, and Page tiers instead of passing the entire document context to every agent.
* **Rationale**: Passing the entire document context increases API costs, exceeds token limits, and can cause agents to lose focus. Partitioning context keeps prompts targeted and cost-efficient.

---

## 11. Future Extensibility
* **Vector Semantic Search**: The memory system can be expanded to support semantic search (e.g. PgVector) to pull relevant snippets from large reference books without changing the database structure.

---

## 12. Implementation Guidance
* Set up database queries to fetch memory profiles.
* Enforce glossary validation checks on all Writer Agent outputs during the validation step.

---

## 13. Acceptance Criteria
* The database builds and runs queries successfully.
* Glossary checks catch styling and branding deviations.
* Rollback actions restore page states to their pre-update structures.

---

## 14. Common Mistakes
* **Token Bloat**: Passing complete document content to page-level editing agents, causing token limit errors.
* **Glossary Drift**: Allowing agents to ignore glossary lists, leading to styling inconsistencies (e.g. writing "API Gateway" in some sections and "api-gateway" in others).

---

## 15. Examples

### Asset Catalog Registry Schema
```json
{
  "asset_catalog": {
    "illustrations": [
      {
        "id": "illust_99a8f21e-128a-40a2-8930-74358c02800c",
        "parent_page": "page_3",
        "description": "API Gateway Flowchart",
        "colors_used": ["--bg-secondary", "--accent-primary"],
        "checksum": "sha256_88bc3b2a"
      }
    ],
    "glossary": [
      {
        "term": "PublishEngine",
        "case_sensitive": true,
        "definition": "The official product name."
      }
    ]
  }
}
```

---

## 16. Decision Records

### ADR-020: JSONB Transaction Diffs
* **Status**: Approved.
* **Context**: Storing full document snapshots for every minor canvas edit increases database storage usage.
* **Decision**: Store revisions as JSONB diff payloads instead of full AST snapshots.
* **Consequence**: Minimizes database storage requirements while maintaining full rollback history.

---

## 17. References to Related Files
* See [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md) for database tables DDL.
* See [CANVAS_EDITOR.md](file:///.agent/CANVAS_EDITOR.md) for editor transaction logs.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for validation details.
