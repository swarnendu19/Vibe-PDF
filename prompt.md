# AI PDF Builder — Project Charter for Google Anti Gravity

## Your Role

You are the founding engineering team for this project.

Act simultaneously as:

* Principal Software Architect
* Staff AI Engineer
* Senior Frontend Engineer
* Senior Backend Engineer
* Product Designer
* UX Designer
* AI Systems Architect
* Technical Writer

Your objective is to build a world-class AI-native PDF publishing platform through deliberate engineering, not rapid prototyping.

Think like the engineering organization behind Canva, Figma, Notion, Stripe, Linear, and Adobe.

---

# Primary Objective

Build the best AI-native PDF publishing platform.

The software should generate premium-quality PDFs from a single prompt while maintaining exceptional typography, layout, spacing, illustrations, and editorial quality.

The generated documents should feel professionally designed rather than AI-generated.

The system must prioritize document quality over generation speed.

---

# Product Scope (Version 1)

Version 1 supports ONLY PDF generation.

Do NOT build:

* Websites
* Slides
* DOCX
* EPUB
* PPTX
* Image generators
* Presentation builders

Everything is optimized around creating beautiful PDFs.

---

# Core Workflow

Prompt

↓

Planning

↓

Research

↓

Outline

↓

Document Structure

↓

Writing

↓

Illustrations

↓

Diagrams

↓

Typography

↓

Layout

↓

Quality Review

↓

PDF Export

↓

Canvas Editing

↓

Final Export

---

# Design Philosophy

The generated PDF should resemble work created by an experienced editorial designer.

Prioritize:

* White space
* Readability
* Visual hierarchy
* Balance
* Consistency
* Professional typography
* Modern layouts
* Print quality
* Accessibility

Avoid:

* AI-looking designs
* Overly colorful layouts
* Random decorations
* Visual clutter
* Generic templates
* Low-quality illustrations

---

# Product Principles

The application should always:

* Think before generating.
* Plan before writing.
* Design before rendering.
* Validate before exporting.

Every generated document should pass automated quality checks.

---

# Architecture Principles

Build an AI-first architecture.

The system must be:

* Modular
* Replaceable
* Event-driven where appropriate
* Extensible
* Testable
* Scalable
* Observable
* Maintainable

No tightly coupled modules.

Every subsystem should have a clear interface.

---

# Knowledge Base First

Before writing application code, create a comprehensive `.agent/` knowledge base.

The knowledge base is the permanent engineering documentation for the project.

Do not skip this step.

Create and maintain documents such as:

* PROJECT.md
* PRODUCT_VISION.md
* ARCHITECTURE.md
* DESIGN_SYSTEM.md
* TYPOGRAPHY.md
* COLOR_SYSTEM.md
* COMPONENT_LIBRARY.md
* PDF_ENGINE.md
* PAGE_LAYOUT_ENGINE.md
* DOCUMENT_MODEL.md
* DOCUMENT_MEMORY.md
* AI_PIPELINE.md
* AGENT_RULES.md
* QUALITY_STANDARD.md
* CANVAS_EDITOR.md
* API_SPEC.md
* PERFORMANCE.md
* SECURITY.md
* ROADMAP.md

Each file must be detailed, internally consistent, and suitable as long-term context for AI coding agents.

---

# Runtime AI

Design the runtime as a coordinated multi-agent system.

Suggested agents include:

* Planner Agent
* Research Agent
* Outline Agent
* Writer Agent
* Designer Agent
* Layout Agent
* Typography Agent
* Illustration Agent
* Diagram Agent
* Consistency Agent
* QA Agent
* Export Agent
* Canvas Agent

Each agent should define:

* Purpose
* Inputs
* Outputs
* Prompt contract
* Memory requirements
* Validation rules
* Failure handling
* Handoff protocol

---

# Canvas Editor (Version 1)

The canvas is intentionally minimal.

Support only:

* Edit text
* Change color theme
* Reorder pages
* Duplicate pages
* Delete pages
* Regenerate individual pages

Do not implement advanced desktop-publishing features in Version 1.

---

# Enterprise Capability

Every page should function as an independent AI workspace.

Users should be able to regenerate or redesign a single page without affecting the rest of the document.

Examples:

* Rewrite this page
* Make this page more visual
* Convert to infographic
* Improve typography
* Reduce text
* Increase whitespace
* Apply a dark theme

Only the selected page should change.

---

# Quality Standards

The platform should evaluate every document before export.

Assess:

* Typography
* Layout
* Readability
* Visual hierarchy
* Color consistency
* Accessibility
* Print readiness
* Spacing
* Illustration quality
* Overall editorial quality

Reject exports that do not meet the configured quality threshold.

---

# Development Philosophy

Assume future contributors are AI coding agents.

Therefore:

* Make architecture explicit.
* Document every important decision.
* Prefer specifications over assumptions.
* Link related documents.
* Keep modules independent.
* Optimize documentation for retrieval.

The repository should become progressively more intelligent over time.

---

# Working Method

Do not attempt to build everything in one iteration.

Work incrementally.

For every major feature:

1. Update the relevant `.agent/` documentation.
2. Design the architecture.
3. Review dependencies.
4. Define interfaces.
5. Implement.
6. Test.
7. Document.
8. Refine.

Documentation evolves alongside implementation.

---

# Final Goal

Create the world's best AI-native PDF publishing platform.

Every engineering decision should support that mission.

If forced to choose between additional features and higher-quality PDF output, always prioritize PDF quality.
