# CONTRIBUTING.md — Knowledge Base Extension Guidelines

This document specifies the rules, patterns, and validation steps for contributing to the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to define the guidelines and pull request checks for contributions. It ensures that both developers and coding agents introduce changes that conform to the project's quality and style standards.

---

## 2. Goals
* Provide guidelines for extending AST elements and page templates.
* Enforce PR validations, including linter runs and visual checks.
* Outline testing requirements before changes are merged.
* Define commit conventions.

---

## 3. Non-Goals
* **No Code Scaffolding**: Does not contain build or development setup scripts.
* **No Database Migrations**: Leaves schema persistence mappings to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
Contributions are verified using automated validation checks before merging:

```
  Contribution Branch ──► Lint Verification ──► Unit & Visual Tests ──► PR Approved
```

---

## 5. Responsibilities
* **Pull Request Auditing**: Verifies that new code conforms to the project guidelines.
* **Documentation Maintenance**: Updates documentation files to reflect any system configuration changes.
* **Release Management**: Coordinates release version logs.

---

## 6. Dependencies
* **Testing Setup**: Connects directly with validation checks defined in [TESTING.md](file:///.agent/TESTING.md).
* **Style Guides**: References formatting rules configured in [STYLE_GUIDE.md](file:///.agent/STYLE_GUIDE.md).

---

## 7. Constraints
* **Commit Conventions**: All commit messages must use semantic prefix formatting.
* **Strict Type Safety**: TypeScript contributions must achieve 100% type coverage.
* **Quality Standards**: Layout updates must achieve a 100% pixel match on visual tests.

---

## 8. Naming Conventions

### Commit Messages
* Message prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
* Example: `feat(layout): add vertical timeline component`.

---

## 9. Folder Structure
* Contribution guidelines and pull request checklists map to:
  * `.github/pull_request_template.md` (contains PR templates).
  * `.github/workflows/ci.yml` (contains validation checks).

---

## 10. Design Decisions

### Enforcing Semantic Commits
* **Decision**: We require all commit messages to follow semantic commit guidelines.
* **Rationale**: Semantic commits make it easier to read the project history and support automated version generation and release log compilations.

---

## 11. Future Extensibility
* **Adding Validation Checks**: CI/CD checks and workflows can be updated in the repository configuration without affecting application code.

---

## 12. Implementation Guidance
* Run formatting and linter checks locally before committing.
* Ensure all unit and visual tests pass successfully prior to opening a PR.

---

## 13. Acceptance Criteria
* The pull request passes all linting checks.
* Visual verification checks return zero layout errors.
* Commit messages follow the semantic rules.

---

## 14. Common Mistakes
* **Outdated Baselines**: Submitting layout changes without updating the baseline references, causing visual test failures.
* **Generic Commits**: Using vague commit messages (e.g. "updates"), which makes changes harder to trace.

---

## 15. Examples

### Semantic Commit Message Pattern
```text
feat(layout): add signature block component

- Add SignatureBlock interface to AST schema
- Create SignatureBlock component styling in CSS
- Update Component Library specs
- Add test suites for SignatureBlock
```

---

## 16. Decision Records

### ADR-032: Automated PR Verifications
* **Status**: Approved.
* **Context**: Manual reviews of code formatting and type safety can be time-consuming.
* **Decision**: Enforce automated linting and type checks for all pull requests.
* **Consequence**: Keeps the codebase clean and ensures style guidelines are met.

---

## 17. References to Related Files
* See [PROJECT.md](file:///.agent/PROJECT.md) for codebase organization.
* See [STYLE_GUIDE.md](file:///.agent/STYLE_GUIDE.md) for coding styles.
* See [TESTING.md](file:///.agent/TESTING.md) for test validation details.
