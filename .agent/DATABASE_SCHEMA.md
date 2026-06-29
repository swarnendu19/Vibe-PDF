# DATABASE_SCHEMA.md — PostgreSQL Relational Schema & Indices

This document specifies the database schemas, tables, relationships, and index configurations for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to define the database structures for persistent data storage. It ensures that the Orchestration Agents and backend services store documents, page layouts, assets, and version logs in a structured PostgreSQL database.

---

## 2. Goals
* Design a relational database schema supporting document version logs and metadata.
* Use JSONB fields to store the nested and flexible elements of the AST.
* Define indices to support quick retrievals of page layouts.
* Enforce integrity using foreign key relationships.

---

## 3. Non-Goals
* **No Database Migration Script generation**: Leaves active migration executions (e.g. Prisma or Knex scripts) to developers.
* **No Node connection files**: Does not implement database pool connections or configuration files.

---

## 4. Architecture
The database schema separates structural documents, pages, elements, assets, and transaction tables:

```
  +───────────────────+             +───────────────────+
  │     documents     │ 1 ────────* │       pages       │
  ├───────────────────┤             ├───────────────────┤
  │ id (UUID, PK)     │             │ id (UUID, PK)     │
  │ title (VARCHAR)   │             │ document_id (FK)  │
  │ metadata (JSONB)  │             │ page_number (INT) │
  │ theme (JSONB)     │             │ layout_var (VC)   │
  +─────────┬─────────+                       │
            │ 1                               │ 1
            │                                 │
            │ *                               │ *
  +─────────▼─────────+             +─────────▼─────────+
  │     revisions     │             │     elements      │
  ├───────────────────┤             ├───────────────────┤
  │ id (UUID, PK)     │             │ id (UUID, PK)     │
  │ document_id (FK)  │             │ page_id (FK)      │
  │ op_type (VARCHAR) │             │ type (VARCHAR)    │
  │ ast_diff (JSONB)  │             │ content (JSONB)   │
  │ created_at (TZ)   │             │ sort_order (INT)  │
  +───────────────────+             +───────────────────+
```

---

## 5. Responsibilities
* **Persistence Management**: Handles structured data persistence.
* **Revision History Tracking**: Tracks transaction entries to support rollsbacks in the Canvas Editor.
* **Asset Cataloging**: Stores generated vectors and assets.

---

## 6. Dependencies
* **Core Database**: PostgreSQL v16+ runtime.
* **AST Structures**: Coordinates directly with interfaces defined in [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md).

---

## 7. Constraints
* **Foreign Key Constraints**: All child tables (pages, elements) must cascade on parent deletions to prevent orphaned records.
* **UUID Primary Keys**: Every table record must generate UUID v4 primary keys.
* **Index Integrity**: Every query path must use indexes.

---

## 8. Naming Conventions

### Database Elements
* Table Names: lowercase plural snake_case (e.g., `documents`, `revisions`).
* Column Names: lowercase singular snake_case (e.g., `page_number`, `element_type`).
* Index Names: `idx_[table_name]_[column_name]` (e.g., `idx_pages_document_id`).

---

## 9. Folder Structure
* Database configurations and SQL scripts map to:
  * `/services/orchestrator/src/database/migrations/` (contains migration files).
  * `/services/orchestrator/src/database/schema.sql` (contains base DDL schemas).

---

## 10. Design Decisions

### Using JSONB for Element Storage
* **Decision**: We store AST elements in a `content` column of type JSONB instead of flat relational columns.
* **Rationale**: The fields in different AST elements vary widely (e.g., headings need levels, tables need rows/columns, checklists need check status). JSONB supports flexible fields, makes schema validation easy, and performs well in Postgres.

---

## 11. Future Extensibility
* **New Metadata Fields**: Adding new visual properties or page settings does not require structural schema updates; properties can be added directly to the document's JSONB metadata column.

---

## 12. Implementation Guidance
* Run migration files in order.
* Use transaction blocks when updating the page ordering or re-compiling page element lists.

---

## 13. Acceptance Criteria
* The DDL script executes without errors.
* Cascading deletes remove all nested child pages and elements.
* Index scans are verified by executing queries with `EXPLAIN ANALYZE`.

---

## 14. Common Mistakes
* **Missing Indexing**: Failing to index foreign key columns, which causes slow queries on large databases.
* **Non-cascading Deletes**: Leaving child pages orphaned when their parent document is deleted.

---

## 15. Examples

### Complete Database Schema (DDL)
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    theme JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    layout_variant VARCHAR(50) NOT NULL,
    header_text VARCHAR(255),
    footer_text VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_document_page UNIQUE (document_id, page_number)
);

CREATE TABLE elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    element_type VARCHAR(50) NOT NULL,
    style_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    content JSONB NOT NULL,
    sort_order INTEGER NOT NULL,
    CONSTRAINT unique_page_element_order UNIQUE (page_id, sort_order)
);

-- Index mappings
CREATE INDEX idx_pages_document_id ON pages(document_id);
CREATE INDEX idx_elements_page_id ON elements(page_id);
CREATE INDEX idx_elements_type ON elements(element_type);
```

---

## 16. Decision Records

### ADR-015: JSONB GIN Indexes
* **Status**: Approved.
* **Context**: Querying nested values inside JSONB fields can lead to slow scans if pages are queried by element attributes.
* **Decision**: Add generalized inverted indexes (GIN) on the `metadata` column of the `documents` table.
* **Consequence**: Ensures high performance when querying files by custom tags.

---

## 17. References to Related Files
* See [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md) for JSON schemas.
* See [PROJECT.md](file:///.agent/PROJECT.md) for codebase organization.
* See [CANVAS_EDITOR.md](file:///.agent/CANVAS_EDITOR.md) for version logs details.
