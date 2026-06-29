# STYLE_GUIDE.md

> Version: 2.0
> Status: Approved
> Owner: Platform Architecture
> Scope: Entire AI PDF Builder Repository

---

# 1. Purpose

This document defines the official engineering style guide for the AI PDF Builder.

It establishes coding conventions, architectural patterns, naming standards, formatting rules, and engineering principles used throughout the project.

This document exists to ensure that every human engineer and AI coding agent produces code that is:

* Consistent
* Predictable
* Readable
* Type-safe
* Maintainable
* Testable
* Scalable

The primary objective is long-term maintainability rather than short-term development speed.

---

# 2. Philosophy

Every line of code should be written as if it will be maintained for the next ten years.

Prefer:

* Simplicity
* Readability
* Explicitness
* Type safety
* Composition
* Predictability

Avoid:

* Clever code
* Hidden behavior
* Magic utilities
* Premature optimization
* Unnecessary abstractions

Code should explain itself before comments are needed.

---

# 3. Guiding Principles

## Readability First

Readable code is preferred over shorter code.

Never sacrifice clarity to reduce line count.

---

## Explicit over Implicit

Prefer explicit parameters, types, and interfaces.

Avoid hidden dependencies.

---

## Composition over Inheritance

Use small reusable modules.

Avoid inheritance hierarchies.

---

## Immutable by Default

Treat objects as immutable whenever practical.

Prefer pure functions.

---

## Type Safety Everywhere

Every exported function must be fully typed.

Never rely on implicit inference for public APIs.

---

# 4. Repository Structure

```text
apps/
    web/

services/
    ai/
    renderer/
    orchestrator/

packages/
    ui/
    document-model/
    design-tokens/
    renderer-core/
    shared/

.agent/

docs/
```

Every module should have a single responsibility.

Cross-module dependencies must remain minimal.

---

# 5. TypeScript Standards

Compiler must always enable:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "exactOptionalPropertyTypes": true,
  "noUncheckedIndexedAccess": true,
  "forceConsistentCasingInFileNames": true,
  "noFallthroughCasesInSwitch": true
}
```

---

## Never Use

```ts
any
```

unless absolutely unavoidable.

Prefer:

* unknown
* generic types
* discriminated unions
* mapped types

---

## Interfaces

Use interfaces for public contracts.

Use type aliases for:

* unions
* utility types
* mapped types
* conditional types

---

## Function Design

Every function should:

* perform one task
* return one predictable result
* avoid side effects
* be independently testable

Avoid functions longer than approximately 50 lines unless complexity genuinely requires it.

---

# 6. Naming Conventions

## Files

PascalCase

```text
DocumentPage.tsx
```

Utility files

camelCase

```text
buildOutline.ts
```

Folders

kebab-case

```text
document-renderer
```

---

## Variables

Good

```ts
pageNumber

chapterTitle

layoutVariant
```

Avoid

```ts
x

temp

foo

bar

obj
```

Names should describe purpose.

---

## Components

PascalCase

```text
CalloutBox

DocumentPage

HeadingBlock

HeroSection
```

---

## Constants

UPPER_SNAKE_CASE

```ts
MAX_PAGE_WIDTH
```

---

## CSS Variables

Semantic names only.

Good

```css
--color-surface
--color-border
--spacing-xl
--font-heading
```

Avoid

```css
--blue
--red
--large-gap
```

---

# 7. Styling Standards

The project uses:

* Tailwind CSS
* CSS Variables
* Design Tokens

Never hardcode:

* colors
* spacing
* typography
* border radius

Use tokens instead.

Example:

```css
var(--spacing-lg)
```

instead of

```css
32px
```

---

# 8. Component Design

Every component should have one responsibility.

Avoid "God Components."

Preferred hierarchy:

```text
Page

↓

Section

↓

Block

↓

Primitive
```

Components should remain composable.

---

# 9. React Guidelines

Prefer:

Server Components

Use Client Components only when required.

Avoid unnecessary effects.

Minimize state.

Prefer derived values.

Use memoization only when profiling demonstrates a benefit.

---

# 10. State Management

Use:

* Zustand for UI state
* TanStack Query for server state

Avoid global state unless truly necessary.

Never duplicate the same state in multiple stores.

---

# 11. Error Handling

Never swallow exceptions.

Always provide meaningful error messages.

Wrap external API calls.

Expose typed errors.

Never return magic strings.

---

# 12. Logging

Use structured logs.

Every log should include context.

Avoid:

```ts
console.log("error")
```

Prefer structured logging with metadata.

---

# 13. Comments

Comments should explain:

WHY

not

WHAT

Bad

```ts
// increment count
count++
```

Good

```ts
// We reserve page 0 for the cover, so content starts at page 1.
```

---

# 14. Documentation

Every exported module should include:

* Purpose
* Inputs
* Outputs
* Constraints

Public APIs require documentation.

Complex algorithms require architecture notes.

---

# 15. Imports

Order imports consistently.

1. Node built-ins
2. Third-party packages
3. Internal packages
4. Relative imports
5. Types
6. Styles

No wildcard imports unless justified.

---

# 16. Testing Standards

Every feature requires:

* Unit tests
* Integration tests
* Rendering tests where applicable

Bug fixes should include regression tests.

---

# 17. Performance

Avoid unnecessary renders.

Avoid deep component trees.

Lazy-load heavy modules.

Split AI-related code from the initial bundle.

Measure before optimizing.

---

# 18. Accessibility

Every UI component must support:

* Keyboard navigation
* Screen readers
* Focus management
* Semantic HTML
* Sufficient color contrast

Accessibility is a default requirement.

---

# 19. AI Coding Rules

AI-generated code must:

* Follow this style guide
* Reuse existing abstractions
* Avoid duplicate implementations
* Preserve architectural boundaries
* Add documentation where appropriate
* Respect naming conventions

When uncertain, AI should prefer consistency with the existing codebase over introducing a new pattern.

---

# 20. Anti-Patterns

Do not introduce:

* Deeply nested conditionals
* Global mutable state
* Circular dependencies
* Business logic in UI components
* Hardcoded design values
* Massive utility files
* Copy-pasted code

Refactor instead of duplicating.

---

# 21. Code Review Checklist

Before merging, verify:

* Naming is clear
* Types are complete
* Components have one responsibility
* No duplicated logic
* Design tokens are used
* Accessibility is maintained
* Tests pass
* Documentation is updated
* No unnecessary dependencies were introduced

---

# 22. Decision Records

### ADR-001

The project follows **Composition over Inheritance**.

Reason:

Composable modules are easier for both humans and AI coding agents to understand, test, and evolve.

---

### ADR-002

Design Tokens are the only source of truth for visual styling.

Reason:

This guarantees visual consistency across the application and enables future theming without modifying component implementations.

---

### ADR-003

Public APIs must be fully typed.

Reason:

Strong typing improves maintainability, IDE support, automated refactoring, and AI-assisted development.

---

# 23. Definition of Done

Code is considered complete only when it:

* Compiles without TypeScript errors
* Passes all automated tests
* Uses design tokens
* Follows naming conventions
* Includes appropriate documentation
* Preserves architectural boundaries
* Meets accessibility requirements
* Avoids unnecessary complexity
* Is understandable without external explanation

Quality is measured by clarity, consistency, and maintainability—not by the amount of code written.
