# ERROR_HANDLING.md — Error Taxonomy & Resolution Protocols

This document defines the system error classifications, automated recovery steps, retry strategies, and Human-in-the-Loop wizards for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the error handling guidelines and recovery routines. It ensures that backend services, coordinators, and agents handle exceptions, API dropouts, and layout overflows gracefully.

---

## 2. Goals
* Categorize errors into structural classes (Validation, API, Layout, System).
* Define automated recovery steps and retry counts.
* Establish thresholds for escalation to Human-in-the-Loop checks.
* Log descriptive error responses.

---

## 3. Non-Goals
* **No Database Migrations**: Leaves logging schema migrations to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Route Logic Implementation**: Does not implement API route handlers (delegated to [API_SPEC.md](file:///.agent/API_SPEC.md)).

---

## 4. Architecture
The error handling system manages exceptions using a multi-tiered recovery process:

```
  Error Encountered ──► [Taxonomy Check] ──► [Auto-Recovery check] ──► [Human-in-the-Loop (HITL)]
                         - Validate error      - Attempt retry            - If retries fail
                         - Fetch error code    - Run pipeline loop        - Open support wizard
```

---

## 5. Responsibilities
* **Error Routing Management**: Routes errors to their designated recovery functions.
* **Retry Coordination**: Tracks retry iterations and enforces backoff limits.
* **HITL Escalation Management**: Triggers manual verification checks when automated retries fail.

---

## 6. Dependencies
* **Core Runtimes**: Node.js microservices defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **API Specifications**: Integrates with endpoints configured in [API_SPEC.md](file:///.agent/API_SPEC.md).

---

## 7. Constraints
* **Max Retry Limit**: Automated agent calls are capped at `3` attempts per execution block.
* **No Cascading Failures**: Errors in one service must be isolated and not crash other microservices.
* **Descriptive Logs**: Error logs must include timestamp, component ID, and error category variables.

---

## 8. Naming Conventions

### Errors
* Classification categories: `ERR_VALIDATION_SCHEMAS`, `ERR_API_LLM_TIMEOUT`, `ERR_LAYOUT_OVERFLOW_FATAL`, `ERR_SYSTEM_CHROME_CRASH`.

---

## 9. Folder Structure
* Error wrappers and handlers map to:
  * `/services/orchestrator/src/errors/` (contains error definitions).
  * `/services/orchestrator/src/pipeline/recovery.ts` (contains recovery handlers).

---

## 10. Design Decisions

### Enforcing Automated Retry Limits
* **Decision**: We cap automated LLM retries at 3 attempts. If the validation continues to fail, we halt execution and escalate the document to a Human-in-the-Loop (HITL) check.
* **Rationale**: Unlimited retries can lead to excessive API costs and slow down compilation pipelines. Capping retries protects resources and alerts users to structural layout issues.

---

## 11. Future Extensibility
* **Adding Error Hooks**: Custom recovery hooks (e.g. sending slack alerts on chrome crashes) can be added to the handler scripts without changing existing system code.

---

## 12. Implementation Guidance
* Group errors using custom class extensions.
* Ensure all error logs are written to the database before initiating recovery retries.

---

## 13. Acceptance Criteria
* The application handles exceptions gracefully.
* Validation failures trigger correct retry workflows.
* System logs record detailed error variables.

---

## 14. Common Mistakes
* **Swallowing Errors**: Using blank catch blocks (`catch (e) {}`), which hides errors and makes debugging difficult.
* **Generic Status Codes**: Returning `500 Internal Server Error` for all API exceptions instead of using descriptive error codes.

---

## 15. Examples

### Custom Error Class Configuration
```typescript
export class LayoutOverflowError extends Error {
  public readonly code = 'ERR_LAYOUT_OVERFLOW_FATAL';
  public readonly pageNumber: number;
  public readonly elementId: string;

  constructor(message: string, pageNumber: number, elementId: string) {
    super(message);
    this.name = 'LayoutOverflowError';
    this.pageNumber = pageNumber;
    this.elementId = elementId;
  }
}
```

---

## 16. Decision Records

### ADR-030: Exponential Backoff Retries
* **Status**: Approved.
* **Context**: Network dropouts can cause temporary API failures.
* **Decision**: Implement exponential backoff delays on all agent API retries.
* **Consequence**: Minimizes API request failures during network issues.

---

## 17. References to Related Files
* See [AI_PIPELINE.md](file:///.agent/AI_PIPELINE.md) for pipeline steps.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for validation schemas.
* See [SECURITY.md](file:///.agent/SECURITY.md) for system codes.
