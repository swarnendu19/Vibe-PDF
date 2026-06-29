# TESTING.md — Testing Matrix & Print Verification Guidelines

This document defines the testing frameworks, automated QA validations, regression strategies, and visual comparison tests for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the testing protocols and verification pipelines. It ensures that developers and coding agents run structured tests to check that layouts, scripts, and compilations function correctly.

---

## 2. Goals
* Standardize on Vitest for unit testing and Playwright for visual tests.
* Implement pixelmatch tests to compare rendered pages against templates.
* Verify that element coordinates align with the baseline grid.
* Validate page containment rules.

---

## 3. Non-Goals
* **No Database Migrations**: Leaves persistence mappings to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Pipeline Code**: Does not implement orchestrator code or state machines.

---

## 4. Architecture
The testing workflow integrates unit tests, DOM validation checks, and visual comparison tests:

```
  Source Code Commit ──► Unit Tests (Vitest) ──► Layout Checks (Playwright) ──► Visual Compare
                          - Checks logic          - Coordinates check            - Pixelmatch check
```

---

## 5. Responsibilities
* **Unit Testing**: Tests compilation functions, state updates, and schema parsers.
* **Layout Testing**: Measures page container sizes and checks for overflows.
* **Visual Testing**: Compares PDF rendering outcomes against baseline layout assets.

---

## 6. Dependencies
* **Core Libraries**: `vitest`, `playwright`, `pixelmatch`.
* **Framework Specifications**: Core settings defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).

---

## 7. Constraints
* **No Layout Shifts**: Text adjustments must not cause container sizes to drift.
* **Zero Pixel Threshold**: Visual comparison tests must achieve a 100% pixel match against reference images.
* **Synchronous Geometry Checks**: Geometry tests inside browser tabs must run synchronously.

---

## 8. Naming Conventions

### Test Files
* Unit test files: `[name].test.ts`.
* Integration test files: `[name].spec.ts`.
* Reference images: `[test_name]-baseline.png`.

---

## 9. Folder Structure
* Testing configurations and test suites map to:
  * `/tests/unit/` (contains unit tests).
  * `/tests/visual/` (contains visual comparison tests and baseline references).

---

## 10. Design Decisions

### Using Visual Comparison Tests (Pixelmatch)
* **Decision**: We use pixelmatch to compare rendered PDF pages against baseline reference images.
* **Rationale**: PDF rendering changes can be subtle. Text drift or grid misalignment can be missed by standard DOM tests. Comparing rendered pixels against target baselines ensures that visual layouts remain consistent.

---

## 11. Future Extensibility
* **Adding New Page Tests**: Tests for new page templates can be added by creating a baseline image and adding a test spec, without changing existing testing code.

---

## 12. Implementation Guidance
* Run Vitest checks during local development runs.
* Set up Playwright visual tests as part of the integration checks.

---

## 13. Acceptance Criteria
* All unit and integration test suites pass without failures.
* Pixelmatch checks return zero differences against baseline layout images.
* Elements align with the spacing and grid specifications.

---

## 14. Common Mistakes
* **Loose Assertions**: Writing tests that check only DOM node counts instead of verifying element layout dimensions.
* **Outdated Baselines**: Failing to update reference baseline images when intentional template updates are made.

---

## 15. Examples

### Playwright Layout Verification Test
```typescript
import { test, expect } from '@playwright/test';

test('verify that cover page title does not exceed height limits', async ({ page }) => {
  await page.goto('http://localhost:8082/sandbox?test=cover');
  await page.waitForSelector('.page-container');
  
  const container = await page.$('.page-container');
  const boundingBox = await container?.boundingBox();
  
  // Height must match Letter dimensions
  expect(boundingBox?.height).toBe(792); 
  
  // Elements must not overflow outer margins
  const content = await page.$('.cover-content');
  const contentBox = await content?.boundingBox();
  expect(contentBox?.height).toBeLessThan(640);
});
```

---

## 16. Decision Records

### ADR-029: Visual Verification Hooks
* **Status**: Approved.
* **Context**: Subtle spacing drifts can bypass DOM structure validations.
* **Decision**: Add visual pixelmatch checks as a validation step for all layout updates.
* **Consequence**: Keeps the output design quality consistent across all platforms.

---

## 17. References to Related Files
* See [PAGE_LAYOUT_ENGINE.md](file:///.agent/PAGE_LAYOUT_ENGINE.md) for layout calculations.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for quality rubrics.
* See [TECH_STACK.md](file:///.agent/TECH_STACK.md) for version numbers.
