# PROJECT.md — Project Manifest & Engineering Entrypoint

This document serves as the master engineering entrypoint and system directory for the AI Publishing Engine. It defines the workspace topology, folder layouts, system-wide naming standards, and architectural blueprints for subsequent implementation by AI coding agents.

---

## 1. Purpose
The purpose of this file is to define the global scope, directory boundaries, naming conventions, and baseline runtime dependencies of the AI Publishing Engine. It serves as the top-level index for the permanent engineering knowledge base, ensuring all future coding agents operate under a unified codebase mapping.

---

## 2. Goals
* Provide a single, complete directory structure mapping for all application modules.
* Establish naming conventions for directories, files, database tables, and environment variables.
* Detail the core engineering boundaries of the V1 product release.
* Serve as the foundational context entrypoint for all downstream agent pipelines.

---

## 3. Non-Goals
* **No Code Scaffolding**: This file does not outline bootstrap scripts or contain operational template directories.
* **No Component Definitions**: It does not define individual layout components or code properties.
* **No Database Schema Definition**: It leaves specific table definitions to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
The AI Publishing Engine is designed around a **Three-Tier Modular Architecture** separated by strict boundaries:

```
+─────────────────────────────────────────────────────────────────────────────+
|                          TIER 1: AGENT ORCHESTRATION                        |
|   Inputs: User Prompts & Documents ────► [Planner -> Writer Agents]         |
|   Outputs: Validated Document Context Object (DCO) AST                      |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ (REST API / SSE)
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                          TIER 2: LAYOUT SANDBOX                             |
|   Inputs: Document AST ────► [Vite/React Engine on Baseline Grid]           |
|   Outputs: Rendered, Print-Safe HTML/CSS DOM Pages                          |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ (Local Render Stream)
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                          TIER 3: PDF COMPILATION                            |
|   Inputs: HTML/CSS Stream ────► [Headless Puppeteer Execution]              |
|   Outputs: Print-Ready or Web-Optimized PDF Binary                          |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 5. Responsibilities
* **Manifest Control**: Coordinates file routing rules and maintains the index of all spec documents.
* **Architecture Validation**: Enforces the separation between the orchestration tier, layout sandbox, and compilation tier.
* **Directory Synchronization**: Ensures that physical repository file paths conform to the predefined directory model.

---

## 6. Dependencies
* **Core Runtimes**: Node.js v20+, Python 3.11+.
* **Layout Sandbox**: React v18+, Vite v5+, TypeScript v5+.
* **PDF Compiler**: Puppeteer v22+ (Chromium head).
* **Specifications**: Relies directly on [PRODUCT_VISION.md](file:///.agent/PRODUCT_VISION.md) and [ARCHITECTURE.md](file:///.agent/ARCHITECTURE.md).

---

## 7. Constraints
* **Directory Bounds**: All software source files must reside in standard workspace directories.
* **No Global Cascade**: Page boundaries must remain isolated; layout rules cannot leak between pages.
* **Access Rules**: Document spec files inside `.agent/` are read-only for production runtimes and serve as system prompt context.

---

## 8. Naming Conventions

### File & Folder Naming
* **Folders**: lowercase snake_case (e.g., `/layout_sandbox`, `/pdf_compiler`).
* **Source Files (JS/TS/Python)**: camelCase (e.g., `layoutEngine.ts`, `compilePdf.py`).
* **Components**: PascalCase (e.g., `CalloutBox.tsx`, `CoverPage.tsx`).
* **Documentation**: UPPER_SNAKE_CASE (e.g., `PRODUCT_VISION.md`, `TYPOGRAPHY.md`).

### Code & Database Naming
* **Database Tables**: lowercase plural snake_case (e.g., `documents`, `pages`, `elements`).
* **Environment Variables**: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`, `PUPPETEER_PORT`).

---

## 9. Folder Structure

```
on-refresh/
├── .agent/                       # Permanent AI Knowledge Base
│   ├── PROJECT.md                # This file
│   ├── PRODUCT_VISION.md         # Product strategy & v1 scope
│   ├── ARCHITECTURE.md           # Multi-agent systems design
│   └── ... (remaining 29 files)
│
├── services/                     # Backend microservices
│   ├── orchestrator/             # Node.js Agent Orchestrator
│   │   ├── src/
│   │   │   ├── agents/           # Planner, Writer, Illustrator code
│   │   │   ├── database/         # DB query handlers
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── compiler/                 # Python/Node.js Puppeteer PDF Compiler
│       ├── src/
│       │   ├── printer.ts        # page.pdf() execution
│       │   └── index.ts
│       └── package.json
│
├── apps/                         # Frontend applications
│   ├── canvas_editor/            # React/Vite Canvas Interface
│   │   ├── src/
│   │   │   ├── components/       # Editorial blocks (TOC, Quotes)
│   │   │   ├── hooks/
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── layout_sandbox/           # Isolated React layout renderer
│       └── src/
│           ├── sandbox.tsx       # Fits elements on baseline grid
│           └── main.tsx
│
└── docker-compose.yml            # System services orchestration
```

---

## 10. Design Decisions

### Decoupling Content from Layout
* **Decision**: We separate text generation (Writer Agent) from coordinate assignment (Layout Agent).
* **Rationale**: If the Writer Agent needs to understand CSS padding or column layouts, the token budget is wasted on geometry rather than syntax. Decoupling allows specialized LLMs to work on specific tasks.

### Sandbox Rendering over PDF Generation Libraries
* **Decision**: We render using HTML/CSS inside Puppeteer instead of native PDF drawing libraries (e.g. PDFKit).
* **Rationale**: Modern CSS (Flexbox, Grid, Baseline Alignment) is highly advanced and well-documented. Drawing shapes manually using coordinates in PDFKit increases development complexity and prevents visual live preview in the Canvas UI.

---

## 11. Future Extensibility
* **Multi-Format Compiling**: The file structure separates output apps (`/compiler`) from layout apps (`/layout_sandbox`). This allows developers to introduce new output targets (e.g., ePUB or slideshows) by creating a new compiler directory without editing the agent core.

---

## 12. Implementation Guidance
When introducing coding agents to build the workspace:
1. Initialize the `/services/orchestrator` repository.
2. Build the database models based on [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
3. Connect the layout sandbox to parse mock AST payloads before wiring the active agents.

---

## 13. Acceptance Criteria
* The repository layout matches the defined folder structure.
* Standard configuration imports enforce the camelCase and PascalCase naming rules.
* All configuration specifications reference this file as the root path identifier.

---

## 14. Common Mistakes
* **Code Leakage**: Scaffolding basic project files inside the `.agent/` folder.
* **Incorrect File Paths**: Referencing files without prefixing the correct absolute folder structure paths.
* **Mixed Cases**: Creating folders using camelCase or filenames using snake_case.

---

## 15. Examples

### Sample Environmental Setup
```bash
# Services Port Definition
ORCHESTRATOR_PORT=8080
COMPILER_PORT=8081
LAYOUT_SANDBOX_PORT=8082

# DB Credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pubengine"
```

---

## 16. Decision Records

### ADR-001: Monolith Repository Structure
* **Status**: Approved.
* **Context**: We need to coordinate updates across multiple microservices and frontends (Orchestrator, Sandbox, Compiler).
* **Decision**: Use a single monorepo structured with clear directory separations (`/services`, `/apps`).
* **Consequence**: Eases orchestration script testing and permits sharing the TypeScript interface type schemas directly between the backend and sandbox apps.

---

## 17. References to Related Files
* See [PRODUCT_VISION.md](file:///.agent/PRODUCT_VISION.md) for target outputs and product definitions.
* See [ARCHITECTURE.md](file:///.agent/ARCHITECTURE.md) for data flow and orchestrator state machine specs.
* See [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md) for persistence structures.
