# AGENT_HANDOFF.md — Orchestrator State Machine & Handoff Schemas

This document specifies the state machine transitions, validation handshakes, and payload formats for the multi-agent pipeline.

---

## 1. Purpose
The purpose of this document is to define the handoff protocols and data schemas for communication between agents. It ensures that the Orchestration Tier passes data consistently between pipeline steps.

---

## 2. Goals
* Map orchestrator state machine transitions from PLANNING to EXPORTING.
* Define JSON request schemas for all handoff connections (e.g. Planner -> Research).
* Standardize error handling and retry behaviors for validation failures.
* Enforce type checks on data transitions.

---

## 3. Non-Goals
* **No Database Table Definitions**: Leaves persistence schemas to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Agent Behavior Guidelines**: Leaves prompt and behavior rules to [AGENT_RULES.md](file:///.agent/AGENT_RULES.md).

---

## 4. Architecture
The orchestrator coordinates data transitions using a centralized State Machine:

```
  PLANNING ──► Validate Plan ──► RESEARCHING ──► Validate Brief ──► OUTLINING
      │                                                               │
      ▼                                                               ▼
  [Retry Loop]                                                   [Retry Loop]
```

---

## 5. Responsibilities
* **Handoff Coordination**: Validates and passes data payloads between agents.
* **Validation Failure Handling**: Logs errors and coordinates retries when validation fails.
* **Transaction Recording**: Records all state transitions in the database.

---

## 6. Dependencies
* **Core Runtimes**: Node.js route libraries defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **AST Validation**: References schema definitions in [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md).

---

## 7. Constraints
* **Validation Checks**: Payloads must pass schema validation before transitioning to the next state.
* **Central State Storage**: Agents are prohibited from communicating directly; all handoffs must write to the central database.
* **State Limit**: State transitions must execute in a sequential order.

---

## 8. Naming Conventions

### Handoff Protocols
* Handoff Protocol IDs: `HP_[SOURCE]_[TARGET]` (e.g. `HP_PLAN_RES`, `HP_RES_OUT`, `HP_OUT_WRT`).

---

## 9. Folder Structure
* Handoff schemas and state logic map to:
  * `/services/orchestrator/src/pipeline/handoffs/` (contains validation files).
  * `/services/orchestrator/src/pipeline/stateMachine.ts` (contains state machine code).

---

## 10. Design Decisions

### Central State Management (DCO)
* **Decision**: We store all step outputs in a central Document Context Object (DCO) instead of passing data directly between agents.
* **Rationale**: Direct communication makes it difficult to audit outputs or support undo steps. Centralizing state in the database makes the pipeline easier to test, audit, and debug.

---

## 11. Future Extensibility
* **New State Transitions**: Custom state transitions (e.g. Translation steps) can be added to the state machine by updating the transition enum without changing existing handoff code.

---

## 12. Implementation Guidance
* Use `zod` to validate all handoff payloads during execution.
* Ensure validation failures write a trace log to the database before initiating a retry.

---

## 13. Acceptance Criteria
* The orchestrator transitions states correctly.
* Handoff payloads pass structural validations.
* Validation failures trigger correct retries.

---

## 14. Common Mistakes
* **Skipping Validation Checks**: Passing outputs directly to the next agent without validating the schema, leading to runtime errors.
* **Direct Agent Calling**: Letting agents trigger each other directly, which bypasses database logging and audits.

---

## 15. Examples

### Planner-to-Research Payload Schema
```json
{
  "document_id": "99a8f21e-128a-40a2-8930-74358c02800c",
  "target_page_count": 6,
  "style_profile": "Nordic Crisp",
  "chapters": [
    {
      "sequence": 1,
      "title": "Core Architecture",
      "research_keywords": ["api gateway", "routing latency"]
    }
  ]
}
```

---

## 16. Decision Records

### ADR-019: Zod-Backed State Validations
* **Status**: Approved.
* **Context**: Schema drift can cause compilation failures if agents write outdated properties.
* **Decision**: Enforce runtime validations on all handoffs using `zod` schemas.
* **Consequence**: Catches schema mismatches immediately and prevents execution errors.

---

## 17. References to Related Files
* See [ARCHITECTURE.md](file:///.agent/ARCHITECTURE.md) for sequence details.
* See [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md) for AST structures.
* See [ERROR_HANDLING.md](file:///.agent/ERROR_HANDLING.md) for retry details.
