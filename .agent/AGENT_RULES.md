# AGENT_RULES.md — AI Agent Behavioral Rules & Constraints

This document defines the rules, constraints, and boundaries governing the behavior of all agents in the compilation pipeline.

---

## 1. Purpose
The purpose of this document is to specify behavioral rules and constraints for the AI agents. It ensures that generated text, graphics, and layouts remain secure, consistent, and aligned with our design system.

---

## 2. Goals
* Prevent agents from outputting conversational text or formatting headers incorrectly.
* Set constraints on token budgets and generation lengths.
* Standardize on copywriting styles that avoid chatbot clichés.
* Enforce design constraints to prevent layout overrides.

---

## 3. Non-Goals
* **No Pipeline Code**: Does not implement orchestrator code or state machines (delegated to [ARCHITECTURE.md](file:///.agent/ARCHITECTURE.md)).
* **No Database Model Code**: Leaves persistence setups to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
Agent behavior is managed by combining system prompts, input budgets, and schema validators:

```
  DCO Input State ──► Agent System Prompt ──► LLM Inference ──► Schema Validator
                      - Constraints injected                     - Checks JSON structure
                      - Budgets enforced                        - If fails, retries
```

---

## 5. Responsibilities
* **Behavior Enforcement**: Restricts outputs to required formats (JSON/SVG).
* **Text Tone Compliance**: Audits text copy to ensure it aligns with the editorial style.
* **Layout Rule Integrity**: Blocks any attempt to add custom margins or layout overrides.

---

## 6. Dependencies
* **Core Runtimes**: TS environments defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **API Schemas**: Connects directly with routes defined in [API_SPEC.md](file:///.agent/API_SPEC.md).

---

## 7. Constraints
* **No Conversational Filler**: Output must contain only the requested data type (e.g. pure JSON or clean SVG); introductory or explanatory text is blocked.
* **Schema Validation**: Every JSON output must validate against its schema before proceeding.
* **Token Limits**:
  * Planner Agent: Input 16k tokens, output 1,028 tokens.
  * Writer Agent: Input 8k tokens, output 800 words max.

---

## 8. Naming Conventions

### Configurations
* System variables: `AGENT_TIMEOUT_MS`, `MAX_RETRIES`.

---

## 9. Folder Structure
* Agent configurations map to:
  * `/services/orchestrator/src/agents/config/` (contains config files).

---

## 10. Design Decisions

### Banning Conversational Text
* **Decision**: We configure system prompts to strictly block conversational text (e.g. *"Here is the JSON you requested..."*).
* **Rationale**: Conversational text breaks JSON parsers, leading to compilation errors. Blocking it ensures stable data exchanges.

---

## 11. Future Extensibility
* **New Agent Types**: Rules for new agent types (e.g., translation agents) can be added to the configurations without modifying existing modules.

---

## 12. Implementation Guidance
* Configure system prompts to use few-shot examples that demonstrate the correct output formats.
* Add schema validation checks to all agent route handlers.

---

## 13. Acceptance Criteria
* The orchestrator compiles files without parsing errors.
* Agent outputs are verified against their schemas.
* Document compilation runs complete within the defined budgets.

---

## 14. Common Mistakes
* **Loose System Prompts**: Writing prompts without explicit schema instructions, which can lead to invalid outputs.
* **Ignoring Limits**: Exceeding output token limits, causing incomplete data generation.

---

## 15. Examples

### System Prompt Configuration (JSON)
```json
{
  "agent_id": "planner_agent",
  "system_instruction": "You are the Publications Planner. Output only a JSON payload matching the schema. Do not include conversational prefixes or markdown wraps.",
  "max_output_tokens": 1024,
  "temperature": 0.1
}
```

---

## 16. Decision Records

### ADR-018: Strict Temperature Controls
* **Status**: Approved.
* **Context**: High temperature values can cause LLMs to generate creative but invalid JSON or layout coordinates.
* **Decision**: Lock LLM temperature settings to `0.1` for layout and structural planning agents.
* **Consequence**: Ensures consistent, schema-compliant JSON outputs.

---

## 17. References to Related Files
* See [ARCHITECTURE.md](file:///.agent/ARCHITECTURE.md) for system sequence details.
* See [PROMPTING_GUIDE.md](file:///.agent/PROMPTING_GUIDE.md) for system prompt templates.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for verification criteria.
