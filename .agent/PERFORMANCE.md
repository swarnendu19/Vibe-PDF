# PERFORMANCE.md — Latency Budgets & Resource Constraints

This document defines compile-time latency budgets, Puppeteer process pooling rules, API caching configurations, and vector asset optimizations for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify performance limits and caching configurations. It ensures that the application compiles documents quickly, keeping total build times under the target 90-second limit.

---

## 2. Goals
* Keep document compilation execution times under 90 seconds.
* Maintain a pool of warm browser instances to reduce tab startup times.
* Define caching strategies for API endpoints and generated assets.
* Establish size limits for inline vectors to prevent rendering lag.

---

## 3. Non-Goals
* **No Database Migrations**: Leaves schema persistence designs to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Client SDK Code generation**: Does not contain client-side loading components or SDK setups.

---

## 4. Architecture
The compilation services use dynamic caching and process pools to optimize rendering times:

```
  User Request ──► [Redis Cache check] ──► [Browser instance Pool] ──► Export File
                      - Cache hit: 10ms       - Reuses warm tabs         - Fast compile
                      - Cache miss: Run API   - Startup time: 300ms      - File size: < 2MB
```

---

## 5. Responsibilities
* **Process Pool Management**: Oversees Chromium instances and keeps tabs warm.
* **Cache Management**: Stores and updates asset records.
* **Vector Optimization**: Simplifies generated SVGs to reduce file size.

---

## 6. Dependencies
* **Core Runtimes**: Node.js and Redis configurations defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **API Specifications**: Integrates with endpoints configured in [API_SPEC.md](file:///.agent/API_SPEC.md).

---

## 7. Constraints
* **Compile Latency**: Total compilation time must not exceed 90 seconds.
* **Max Browser Tabs**: Browser contexts are capped at 5 active tabs per Chromium process.
* **SVG Complexity Limit**: Generated inline SVGs must not exceed 50KB in file size.

---

## 8. Naming Conventions

### Latency Profiles
* Phase Latency Budget Variables: `SynthesisBudget`, `LayoutBudget`, `CompileBudget`.

---

## 9. Folder Structure
* Performance settings and pooling files map to:
  * `/services/compiler/src/pool/` (contains browser management scripts).
  * `/services/orchestrator/src/cache/` (contains Redis cache scripts).

---

## 10. Design Decisions

### persistent Browser Pooling
* **Decision**: We keep a pool of warm browser instances running in the compiler service instead of starting a new browser process for each PDF compilation request.
* **Rationale**: Starting Chromium processes adds up to 1.5 seconds of overhead. Keeping a pool of warm browser tabs ready reduces startup times to under 300ms.

---

## 11. Future Extensibility
* **Distributed Compilation**: The compiler service is designed to be stateless, allowing developers to add more compiler instances behind a load balancer to support higher traffic in the future.

---

## 12. Implementation Guidance
* Monitor compile-time metrics for each step in the pipeline.
* Set up standard cleanups for recycled browser tabs to prevent memory leaks.

---

## 13. Acceptance Criteria
* The application builds and runs compile steps within the target budgets.
* Warm browser tabs are successfully reused.
* Running multiple exports in parallel does not cause process crashes.

---

## 14. Common Mistakes
* **Process Leaks**: Failing to close tabs or processes after export errors, which causes memory leaks on the host machine.
* **Caching Large ASTs**: Storing large, uncompressed document ASTs in Redis, which increases memory usage.

---

## 15. Examples

### Phase Budget Definition (JSON)
```json
{
  "document_id": "99a8f21e-128a-40a2-8930-74358c02800c",
  "budgets": {
    "total_limit_ms": 90000,
    "phases": {
      "content_synthesis_ms": 40000,
      "layout_mapping_ms": 20000,
      "pdf_compilation_ms": 10000
    }
  }
}
```

---

## 16. Decision Records

### ADR-027: Redis Response Caching
* **Status**: Approved.
* **Context**: Repeated API requests for static assets (like icons or stylesheets) increase server load.
* **Decision**: Cache static asset records and compilation statuses in Redis with a 24-hour expiration window.
* **Consequence**: Reduces database load and speeds up document metadata retrievals.

---

## 17. References to Related Files
* See [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md) for Chromium configurations.
* See [API_SPEC.md](file:///.agent/API_SPEC.md) for endpoint details.
* See [ERROR_HANDLING.md](file:///.agent/ERROR_HANDLING.md) for timeout recovery options.
