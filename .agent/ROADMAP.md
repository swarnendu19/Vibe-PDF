# ROADMAP.md — Engineering Milestones & V2 Vision

This document outlines the project development phases, engineering milestones, and V2 extension roadmap for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the engineering roadmap and development phases. It guides developers and coding agents on priorities and helps ensure the architecture remains extensible for future releases.

---

## 2. Goals
* Detail a 3-phase development schedule (Foundations, Sandbox, Pipeline).
* Identify milestones and deliverables for each phase.
* Outline the V2 extension roadmap (e.g. interactive forms).
* Define transition metrics for each phase.

---

## 3. Non-Goals
* **No Database Migrations**: Leaves SQL schema migrations to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Code Scaffolding**: Does not contain active code files or templates.

---

## 4. Architecture
The roadmap organizes the project development into three sequential milestones:

```
  +───────────────────────────────────────────────────────────+
  │             PHASE 1: FOUNDATION RUNTIME                   │
  │  - Database setup, API routing, and security sandbox      │
  +─────────────────────────────┬─────────────────────────────+
                                ▼
  +───────────────────────────────────────────────────────────+
  │             PHASE 2: RENDERING SANDBOX                    │
  │  - Vite Page Sandbox, baseline grid CSS, and components   │
  +─────────────────────────────┬─────────────────────────────+
                                ▼
  +───────────────────────────────────────────────────────────+
  │             PHASE 3: PIPELINE COORD                       │
  │  - Agent loops, progress tracking, and exporter profiles  │
  +───────────────────────────────────────────────────────────+
```

---

## 5. Responsibilities
* **Milestone Auditing**: Tracks development progress against phase deadlines.
* **Architecture Validation**: Verifies that new code matches existing specifications.
* **Roadmap Refinement**: Reviews and updates feature targets.

---

## 6. Dependencies
* **Core Runtimes**: TS compiler configurations defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **APIs & Renders**: Connects directly with modules defined in [API_SPEC.md](file:///.agent/API_SPEC.md).

---

## 7. Constraints
* **Phase Sequencing**: Phase 2 must not start until Phase 1 deliverables are validated.
* **No V2 Code**: V2 extension features must not be implemented during V1 development.
* **V1 Priority**: Focus on producing high-fidelity PDF output.

---

## 8. Naming Conventions

### Milestones
* Milestone identifiers: `M_[PHASE]_[INDEX]` (e.g. `M_PH1_01`, `M_PH2_03`).

---

## 9. Folder Structure
* The roadmap acts as a directory index and links to:
  * `.agent/` (all documentation files).

---

## 10. Design Decisions

### Phase-Based Development
* **Decision**: We divide the development schedule into three distinct phases.
* **Rationale**: Phase-based development makes it easier to catch errors early. Building and validating the layout sandbox before connecting the orchestrator agents ensures that layout issues are caught before generating content.

---

## 11. Future Extensibility
* **Interactive Presentations**: The AST model is designed to support custom aspect ratios, enabling support for presentation slides and interactive web documents in future releases.

---

## 12. Implementation Guidance
* Run integration tests at the end of each development phase.
* Verify that new code meets the requirements of the style guides.

---

## 13. Acceptance Criteria
* The application builds successfully at each milestone.
* Integration and unit tests pass without failures.
* Rendered outputs match the selected styles and layout templates.

---

## 14. Common Mistakes
* **Feature Injections**: Attempting to implement V2 features (like interactive pages) during V1 development, which can delay core milestones.
* **Skipping Milestones**: Moving to agent integrations before completing the sandbox, which makes layout debugging more difficult.

---

## 15. Examples

### Phase Schedule Definitions
```json
{
  "project_milestones": [
    {
      "id": "M_PH1_01",
      "phase": "FOUNDATION",
      "deliverable": "Database schema and route infrastructure build.",
      "completion_target_days": 10
    },
    {
      "id": "M_PH2_01",
      "phase": "SANDBOX",
      "deliverable": "Vite React Sandbox with standard layout components.",
      "completion_target_days": 20
    }
  ]
}
```

---

## 16. Decision Records

### ADR-031: V1 Scope Lock
* **Status**: Approved.
* **Context**: Feature requests during development can delay release schedules.
* **Decision**: Lock the V1 feature scope to static PDF generation and basic canvas edits.
* **Consequence**: Keeps the focus on core quality standards and ensures a stable release.

---

## 17. References to Related Files
* See [PROJECT.md](file:///.agent/PROJECT.md) for folder structures.
* See [TESTING.md](file:///.agent/TESTING.md) for verification guidelines.
* See [CONTRIBUTING.md](file:///.agent/CONTRIBUTING.md) for extension steps.
