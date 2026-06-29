# QUALITY_STANDARD.md — Document Quality Standards & Validation Rubric

This document specifies the design quality standards, evaluation metrics, and validation rules enforced by the QA Agent before exporting documents.

---

## 1. Purpose
The purpose of this document is to define the quality standards for generated documents. It ensures that the QA Agent audits every page layout, blocking exports that do not meet professional editorial standards.

---

## 2. Goals
* Establish a scoring rubric (0 to 100) to measure design quality.
* Enforce automatic refusal policies for documents scoring below 90 points.
* Verify typography alignments, spacing rules, and contrast ratios.
* Check print settings and accessibility tags.

---

## 3. Non-Goals
* **No Code Implementation**: Does not implement validation scripts or test runners (delegated to [TESTING.md](file:///.agent/TESTING.md)).
* **No Database Migrations**: Leaves schema migrations to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
The quality checks run as a validation step inside the compilation pipeline:

```
  DCO Layout Output ──► QA Agent Audit ──► Output Score (0-100)
                                                 │
                  ┌──────────────────────────────┴──────────────────────────────┐
                  ▼ (Score >= 90)                                               ▼ (Score < 90)
           Compile PDF                                                   Refuse Export
                                                                         - Log errors
                                                                         - Trigger re-plan
```

---

## 5. Responsibilities
* **Quality Auditing**: Evaluates layouts against the scoring rubric.
* **Refusal Enforcement**: Blocks export requests if quality thresholds are not met.
* **Error Logging**: Writes detailed audit failures to the compilation logs.

---

## 6. Dependencies
* **Core Systems**: Node.js microservices defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **Render Pipeline**: Integrates with [PAGE_LAYOUT_ENGINE.md](file:///.agent/PAGE_LAYOUT_ENGINE.md) to check page fitting bounds.

---

## 7. Constraints
* **Minimum Score**: Documents must score at least `90` points to pass.
* **Hard Refusal Criteria**: Any instance of overflow, overlapping elements, or text contrast below 7:1 results in an automatic failure (0 points).
* **No Banned Words**: Text copy must contain zero occurrences of restricted chatbot jargon (e.g. `delve`, `tapestry`).

---

## 8. Naming Conventions

### Errors
* Quality error codes: `ERR_QA_TYPO_WIDOW`, `ERR_QA_LAYOUT_OVERFLOW`, `ERR_QA_COLOR_CONTRAST`, `ERR_QA_SVG_INVALID`, `ERR_QA_STYLE_DRIFT`, `ERR_QA_EDITORIAL_JARGON`.

---

## 9. Folder Structure
* Quality checks and audit logic map to:
  * `/services/orchestrator/src/pipeline/qa/` (contains QA validator files).
  * `/services/orchestrator/src/pipeline/qa/rubricEvaluator.ts` (contains scoring logic).

---

## 10. Design Decisions

### Enforcing a Hard Refusal Policy
* **Decision**: We block document compilation if the layout does not meet the minimum 90-point quality score.
* **Rationale**: Exporting misaligned or overflowing layouts compromises the product's value proposition of delivering professional, design-agency-quality documents out of the box. Enforcing a hard threshold ensures consistent quality.

---

## 11. Future Extensibility
* **New Auditing Rules**: Custom rules (e.g. checking company brand guidelines) can be added to the evaluator by adding a validation class without changing the core pipeline sequence.

---

## 12. Implementation Guidance
* Set up the QA Agent to scan the sandbox DOM and evaluate visual metrics.
* Ensure all audit failures are logged with descriptive error codes to guide the orchestrator's retry steps.

---

## 13. Acceptance Criteria
* The QA validator compiles successfully.
* Layout failures are caught and block the export process.
* Compliant documents pass validation checks with correct scores.

---

## 14. Common Mistakes
* **Lax Thresholds**: Allowing minor layout overflows or poor contrast combinations to pass, which degrades export quality.
* **Vague Logs**: Returning generic error messages (e.g. "Layout invalid") instead of referencing specific elements, making it difficult for agents to execute targeted retries.

---

## 15. Examples

### QA Audit Log Payload
```json
{
  "document_id": "99a8f21e-128a-40a2-8930-74358c02800c",
  "audit_result": {
    "score": 85,
    "status": "FAILED",
    "failures": [
      {
        "code": "ERR_QA_LAYOUT_OVERFLOW",
        "page": 3,
        "element_id": "elem_para_04",
        "details": "Element height (124pt) exceeds remaining page budget by 16pt."
      }
    ]
  }
}
```

---

## 16. Decision Records

### ADR-023: Automated Contrast Audits
* **Status**: Approved.
* **Context**: Dark mode elements can be hard to read if text colors do not update cleanly against dark surfaces.
* **Decision**: Use WCAG contrast algorithms to audit all text elements before export.
* **Consequence**: Guarantees document readability across all themes and orientations.

---

## 17. References to Related Files
* See [DESIGN_PRINCIPLES.md](file:///.agent/DESIGN_PRINCIPLES.md) for visual rules.
* See [ERROR_HANDLING.md](file:///.agent/ERROR_HANDLING.md) for exception recovery options.
* See [TESTING.md](file:///.agent/TESTING.md) for validation testing setups.
