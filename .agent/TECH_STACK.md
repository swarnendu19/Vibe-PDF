# TECH_STACK.md

> **Version:** 1.0
> **Status:** Approved
> **Owner:** Platform Architecture
> **Scope:** Entire AI PDF Builder Platform

---

# 1. Purpose

This document defines the official technology stack for the AI PDF Builder.

It exists to ensure that every engineer and AI coding agent builds the system using the same architectural standards.

The technology choices prioritize:

* Long-term maintainability
* AI-native development
* Modular architecture
* High performance
* Enterprise scalability
* Beautiful PDF generation
* Type safety
* Excellent developer experience

---

# 2. Engineering Philosophy

This product is **NOT** a CRUD application.

This product is an AI-native publishing platform.

Every technology decision must improve one or more of the following:

* PDF quality
* AI orchestration
* Developer productivity
* Reliability
* Extensibility
* Rendering performance

---

# 3. Core Principles

## Prefer

* Type safety
* Compile-time validation
* Server-first architecture
* Strong typing
* Functional composition
* Explicit interfaces
* Modular systems
* Small reusable packages

---

## Avoid

* Runtime magic
* Heavy UI libraries
* Deep inheritance
* Global mutable state
* Monolithic services
* Vendor lock-in

---

# 4. High-Level Architecture

```text
                     User

                       │

               Next.js Application

                       │

────────────────────────────────────────────

              AI Orchestrator

     Planner Agent

     Research Agent

     Writer Agent

     Designer Agent

     Layout Agent

     Typography Agent

     QA Agent

     Export Agent

────────────────────────────────────────────

         Document AST Engine

────────────────────────────────────────────

         PDF Rendering Engine

────────────────────────────────────────────

      PostgreSQL + Redis + Object Storage
```

---

# 5. Technology Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| Language        | TypeScript                                   |
| Runtime         | Node.js 22 LTS                               |
| Frontend        | Next.js 15 (App Router)                      |
| UI              | React                                        |
| Styling         | Tailwind CSS + CSS Variables + Design Tokens |
| Backend         | Fastify                                      |
| Database        | PostgreSQL 17                                |
| ORM             | Drizzle ORM                                  |
| Cache           | Redis                                        |
| Queue           | BullMQ                                       |
| Object Storage  | Cloudflare R2                                |
| AI SDK          | Vercel AI SDK                                |
| Authentication  | Better Auth                                  |
| State           | Zustand                                      |
| Server State    | TanStack Query                               |
| Forms           | React Hook Form                              |
| Validation      | Zod                                          |
| Editor          | Tiptap                                       |
| Monorepo        | Turborepo                                    |
| Package Manager | pnpm                                         |
| Testing         | Vitest + Playwright                          |
| Deployment      | Vercel + Railway/Fly.io                      |
| Monitoring      | OpenTelemetry                                |

---

# 6. Frontend Stack

## Framework

Next.js App Router

Reasons:

* React Server Components
* Streaming
* Server Actions
* Edge compatibility
* Excellent routing
* Modern rendering model
* Superior deployment experience

Vite is intentionally not used.

---

## Styling

Tailwind CSS

CSS Variables

Design Tokens

Modern CSS

The platform maintains its own design system.

Third-party component kits are not allowed.

Examples:

❌ Material UI

❌ Chakra UI

❌ Ant Design

❌ Bootstrap

Only primitive reusable components are permitted.

---

## Animation

Framer Motion

Use sparingly.

Animations should enhance usability rather than decorate the interface.

---

# 7. Backend Stack

Framework

Fastify

Reasons:

* Excellent performance
* Native schema validation
* Low memory usage
* TypeScript-first ecosystem
* Mature plugin architecture

Express is not used.

---

# 8. AI Layer

The AI layer is service-oriented.

Primary components:

Planner

Research

Writer

Designer

Layout

Typography

Illustration

Diagram

QA

Exporter

Every AI agent operates independently.

Agents communicate through structured contracts.

Agents never share mutable state.

---

# 9. Database

Primary Database

PostgreSQL 17

Reasons:

* Reliability
* Mature ecosystem
* JSONB
* Full-text search
* Extensions
* Transactions

---

## ORM

Drizzle ORM

Reasons:

* SQL-first

* Excellent TypeScript

* Lightweight

* Fast

* Predictable

---

# 10. Cache

Redis

Responsibilities

* Queue state

* AI progress

* Session cache

* Rate limiting

* Temporary document state

---

# 11. Queue System

BullMQ

Responsibilities

Long-running AI jobs

Document generation

PDF rendering

Image generation

Background processing

Retry handling

---

# 12. Object Storage

Cloudflare R2

Stores:

PDFs

Fonts

Illustrations

Generated assets

Images

Templates

Exports

---

# 13. Authentication

Better Auth

Reasons:

Modern

Type-safe

Framework-friendly

Open source

---

# 14. State Management

Global UI State

Zustand

Remote Data

TanStack Query

Forms

React Hook Form

Validation

Zod

---

# 15. Editor

Tiptap

Responsibilities

Text editing

Inline formatting

Minimal rich text

The editor is intentionally minimal.

The AI—not the user—is responsible for layout.

---

# 16. PDF Engine

The platform does NOT rely on Puppeteer as its primary rendering engine.

Pipeline

```text
Prompt

↓

Document AST

↓

Layout Engine

↓

Typography Engine

↓

Illustration Engine

↓

PDF Renderer

↓

Export
```

Puppeteer may be used only as a compatibility fallback.

---

# 17. Monorepo Structure

```text
apps/
    web/

services/
    orchestrator/
    renderer/
    ai/

packages/
    ui/
    design-tokens/
    document-model/
    renderer-core/
    ai-sdk/
    shared/

.agent/

docs/
```

---

# 18. Package Policy

Allowed:

* Zod
* Drizzle
* Fastify
* Tailwind
* React Hook Form
* TanStack Query
* Zustand
* Tiptap
* BullMQ
* OpenTelemetry

Forbidden without architecture approval:

* Redux
* Express
* Material UI
* Chakra UI
* Bootstrap
* jQuery
* Lodash (unless justified)
* CSS-in-JS runtime libraries

---

# 19. TypeScript Standards

The project must compile with:

* strict
* noImplicitAny
* exactOptionalPropertyTypes
* noUncheckedIndexedAccess
* noImplicitOverride
* noFallthroughCasesInSwitch

Type safety is mandatory.

---

# 20. Testing

Unit

Vitest

Component

React Testing Library

E2E

Playwright

Visual Regression

Playwright snapshots

Every critical rendering path must have automated tests.

---

# 21. Observability

Required:

* Structured logging
* OpenTelemetry tracing
* Error reporting
* Performance metrics
* Queue metrics
* AI execution metrics

No production service should operate without observability.

---

# 22. Deployment

Frontend

Vercel

Backend

Railway or Fly.io

Database

Neon PostgreSQL

Storage

Cloudflare R2

Redis

Upstash or managed Redis

---

# 23. Security

Never expose:

* API keys
* AI credentials
* Database credentials
* Internal prompts

Secrets must be injected through environment variables.

---

# 24. Future Technology Roadmap

Potential future additions:

* Rust rendering engine
* GPU layout acceleration
* Distributed AI orchestration
* Self-hosted inference
* Vector database integration
* Multi-renderer output (DOCX, EPUB, HTML)

These are intentionally out of scope for Version 1.

---

# 25. Technology Decision Records

### ADR-001

Next.js replaces Vite.

Reason:

Server-first architecture, streaming, Server Actions, and a unified framework provide a stronger foundation for an AI-native application than a client-focused build tool.

---

### ADR-002

Drizzle replaces raw SQL drivers.

Reason:

Type safety and maintainability while preserving SQL-first development.

---

### ADR-003

Fastify replaces Express.

Reason:

Higher performance, better TypeScript support, and native schema validation.

---

### ADR-004

Tailwind CSS is approved.

Reason:

Utility-first styling, zero runtime overhead after build, and seamless integration with a token-based design system.

---

### ADR-005

The renderer is built around a **Document AST**.

Reason:

Separating document structure from rendering enables multiple output formats in the future while keeping PDF as the primary target in Version 1.

---

# 26. Definition of Done

A technology choice is considered accepted only if it:

* Improves maintainability
* Preserves modularity
* Is fully type-safe
* Has a clear ownership boundary
* Integrates with the AI-first architecture
* Can evolve without requiring a rewrite of unrelated systems
* Supports the long-term vision of an enterprise-grade AI publishing platform
