# PROMPTING_GUIDE.md — System Prompts & Few-Shot Specifications

This document defines the system prompts, few-shot generation structures, context parameters, and temperature limits for the active pipeline agents.

---

## 1. Purpose
The purpose of this document is to specify the system prompt templates and LLM configurations. It ensures that agents produce structured, schema-compliant JSON data and clean SVG vectors consistently.

---

## 2. Goals
* Provide system prompts for Planner, Writer, Illustrator, and Layout agents.
* Enforce temperature and max token bounds for each agent type.
* Embed validation guidelines directly into prompts.
* Prevent conversational filler text in responses.

---

## 3. Non-Goals
* **No Client SDK Code generation**: Does not contain code integrations or SDK client setups.
* **No Database Migrations**: Leaves persistence mappings to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
The prompt configurations are loaded dynamically by the orchestrator service:

```
  User Prompt ──► [Pipeline State Manager] ──► Inject Context & Prompt Templates ──► LLM Call
```

---

## 5. Responsibilities
* **Prompt Assembly**: Assembles system instructions, contextual variables, and few-shot examples.
* **LLM Config Enforcement**: Enforces temperature, token, and top-p limits.
* **Handoff Formatting**: Formats agent inputs to match the current pipeline state.

---

## 6. Dependencies
* **Core Runtimes**: Node.js config files defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **Behavior Guidelines**: Coordinates with rules defined in [AGENT_RULES.md](file:///.agent/AGENT_RULES.md).

---

## 7. Constraints
* **Pure JSON Output**: System prompts must instruct agents to omit conversational filler text.
* **Temperature Limits**: Locked to `0.1` for layout and structural agents, and `0.7` for writers.
* **Strict Schema Outlines**: Prompt instructions must contain inline definitions of the target JSON schemas.

---

## 8. Naming Conventions

### Prompts
* System templates: `sys_[agent_name].txt` (e.g. `sys_planner.txt`, `sys_writer.txt`).

---

## 9. Folder Structure
* System prompts and templates map to:
  * `/services/orchestrator/src/agents/prompts/` (contains prompt text files).

---

## 10. Design Decisions

### Embedded Few-Shot Scenarios
* **Decision**: We include complete, mini few-shot examples inside system prompt templates.
* **Rationale**: LLMs follow formatting instructions much better when shown input-output examples. Showing exact outputs helps ensure schema-compliant structures.

---

## 11. Future Extensibility
* **New Agent Types**: Prompts for new agent types can be added to the templates folder without modifying orchestrator code.

---

## 12. Implementation Guidance
* Read system instructions from text files at runtime to keep prompts separate from code.
* Use template strings to inject dynamic context values into prompt bodies.

---

## 13. Acceptance Criteria
* The orchestrator compiles and loads prompts without errors.
* LLMs generate schema-compliant structures that pass validation checks.
* Output formats contain zero conversational filler text.

---

## 14. Common Mistakes
* **Hardcoded Prompts**: Hardcoding system prompts directly inside TypeScript files, which makes updates difficult.
* **Lax Tone Instructions**: Omitting formatting constraints, leading to conversational text inclusions that break JSON parsing.

---

## 15. Examples

### Planner System Prompt Template (`sys_planner.txt`)
```text
You are the Publications Planner. Your job is to parse the user's request and outline a page-by-page layout structure for the document.
Output only a valid JSON object matching the schema below. Do not include markdown formatting or introduction text.

Target Schema:
{
  "title": "String",
  "theme": "String",
  "chapters": [
    {
      "sequence": "Number",
      "title": "String",
      "purpose": "String"
    }
  ]
}

Few-shot Example Input: "Create a 3-page guide on API gateways."
Few-shot Example Output:
{
  "title": "API Gateway Guide",
  "theme": "nordic_crisp",
  "chapters": [
    { "sequence": 1, "title": "Introduction", "purpose": "Overview of gateways." }
  ]
}
```

---

## 16. Decision Records

### ADR-024: Prompt Isolation
* **Status**: Approved.
* **Context**: Updating prompts inside code files is error-prone and can trigger rebuilds.
* **Decision**: Keep prompt files separate from application logic, loading them from the `/prompts/` directory.
* **Consequence**: Enables prompt updates without requiring service redeployments.

---

## 17. References to Related Files
* See [AGENT_RULES.md](file:///.agent/AGENT_RULES.md) for behavioral rules.
* See [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md) for AST structural schemas.
* See [ERROR_HANDLING.md](file:///.agent/ERROR_HANDLING.md) for validation recovery options.
