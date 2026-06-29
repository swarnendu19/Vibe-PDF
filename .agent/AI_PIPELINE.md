# AI_PIPELINE.md — Multi-Agent Ingestion & Compilation Pipeline

This document specifies the pipeline flow, execution stages, and coordination rules of the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to define the compilation pipeline and agent coordination workflows. It guides coding agents on the sequence of operations required to translate user prompts into a validated PDF document.

---

## 2. Goals
* Orchestrate agent execution in a three-phase compilation pipeline.
* Standardize data handoffs using the Document Context Object (DCO) schema.
* Implement error recovery and fallback loops for LLM failures.
* Track compilation milestones for real-time progress reporting.

---

## 3. Non-Goals
* **No Specific System Prompts**: Does not contain detailed system prompt messages or shot-examples (delegated to [PROMPTING_GUIDE.md](file:///.agent/PROMPTING_GUIDE.md)).
* **No Database Model Code**: Leaves persistence setups to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
The compilation pipeline is divided into three sequential phases:

```
+─────────────────────────────────────────────────────────────────────────────+
|                          PHASE 1: CONTENT SYNTHESIS                         |
|  User Input ──► [Planner] ──► [Research] ──► [Outline] ──► [Writer]         |
+──────────────────────────────────────────────────────┬──────────────────────+
                                                       │
                                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                          PHASE 2: LAYOUT FRAMING                            |
|  [Writer Output] ──► [Illustration/Diagram] ──► [Typography] ──► [Layout]    |
+──────────────────────────────────────────────────────┬──────────────────────+
                                                       │
                                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                          PHASE 3: OUTPUT COMPILATION                        |
|  [Layout AST] ──► [Page Sandbox Fit Check] ──► [Consistency/QA] ──► [Export] |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 5. Responsibilities
* **Pipeline Coordination**: Manages agent execution order and states.
* **Progress Tracking**: Updates document status records in the database.
* **Fallback Routing**: Triggers secondary models or human-in-the-loop flows when errors occur.

---

## 6. Dependencies
* **API Streams**: Connects directly with routes defined in [API_SPEC.md](file:///.agent/API_SPEC.md).
* **Agent Settings**: References execution rules defined in [AGENT_RULES.md](file:///.agent/AGENT_RULES.md).

---

## 7. Constraints
* **Phase Budgets**:
  * Phase 1 (Content Synthesis): < 40 seconds.
  * Phase 2 (Layout & Graphics): < 20 seconds.
  * Phase 3 (PDF Compilation): < 10 seconds.
* **Linear Execution**: Phase 2 must not start until Phase 1 outputs are validated.

---

## 8. Naming Conventions

### Pipeline States
* `PLANNING`, `RESEARCHING`, `OUTLINING`, `WRITING`, `ASSET_GEN`, `TYPOGRAPHY_BIND`, `LAYOUT_MAPPING`, `FIT_VERIFICATION`, `EXPORTING`.

---

## 9. Folder Structure
* Pipeline code and coordinators map to:
  * `/services/orchestrator/src/pipeline/` (contains stage managers).
  * `/services/orchestrator/src/pipeline/pipelineCoordinator.ts` (contains the main coordinator).

---

## 10. Design Decisions

### Phase-Based Execution
* **Decision**: We run the pipeline in distinct phases, validating the AST at each step, instead of running all agents in parallel.
* **Rationale**: Validating outputs at each step makes it easier to catch errors (e.g. outline mismatch) early, avoiding wasted API calls and rendering issues in downstream steps.

---

## 11. Future Extensibility
* **New Agent Steps**: Custom agent steps (e.g. Translator Agent) can be added to the pipeline by creating a new stage configuration without affecting the core coordinator.

---

## 12. Implementation Guidance
* Store all pipeline executions in the database.
* Emit progress updates using the SSE methods defined in the API specifications.

---

## 13. Acceptance Criteria
* The pipeline compiles files within the specified latency budgets.
* Validation failures halt execution and trigger recovery workflows.
* Real-time progress updates are sent to the client browser.

---

## 14. Common Mistakes
* **Parallel Pipeline Running**: Running content generation and layout rendering in parallel, which leads to layout issues and validation failures.
* **Ignoring Timeouts**: Failing to set timeouts on agent requests, causing the pipeline to hang on connection drops.

---

## 15. Examples

### Pipeline Progress Events Log
```json
{
  "document_id": "99a8f21e-128a-40a2-8930-74358c02800c",
  "events": [
    { "timestamp": "2026-06-27T17:35:00Z", "stage": "PLANNING", "status": "COMPLETE" },
    { "timestamp": "2026-06-27T17:35:10Z", "stage": "RESEARCHING", "status": "COMPLETE" },
    { "timestamp": "2026-06-27T17:35:35Z", "stage": "WRITING", "status": "COMPLETE" }
  ]
}
```

---

## 16. Decision Records

### ADR-017: Agent Execution Timeouts
* **Status**: Approved.
* **Context**: Network issues or slow LLMs can delay compilation.
* **Decision**: Enforce a 45-second execution timeout on all agent API requests.
* **Consequence**: Prevents the pipeline from hanging and triggers fallbacks quickly.

---

## 17. References to Related Files
* See [ARCHITECTURE.md](file:///.agent/ARCHITECTURE.md) for sequence details.
* See [AGENT_HANDOFF.md](file:///.agent/AGENT_HANDOFF.md) for data schemas.
* See [ERROR_HANDLING.md](file:///.agent/ERROR_HANDLING.md) for recovery details.
