# API_SPEC.md — OpenAPI REST & Progress Webhook Specifications

This document defines the REST API endpoints and Server-Sent Event (SSE) streaming protocols for communication between the UI, the orchestration tier, and the compilation services.

---

## 1. Purpose
The purpose of this document is to specify the API specifications of the system. It enables frontend and backend teams to build applications that communicate reliably using structured request and response payloads.

---

## 2. Goals
* Define HTTP endpoints for document creation, theme updates, and page reordering.
* Detail request and response schemas using JSON formats.
* Specify Server-Sent Event (SSE) payloads for progress tracking.
* Set constraints for API rate-limiting and authorization requirements.

---

## 3. Non-Goals
* **No Client SDK Code generation**: Does not contain generated client libraries or integration SDKs.
* **No Backend Route logic**: Leaves routing code configurations to the backend.

---

## 4. Architecture
The API acts as the communication interface between the UI and backend services:

```
  Canvas Editor UI ──► REST API request ──► API Route Handler ──► Agent Orchestrator
                   ◄── SSE Status Stream ◄── Progress updates  ◄── Pipeline updates
```

---

## 5. Responsibilities
* **API Route Handlers**: Manages endpoint requests and maps them to agent executions.
* **Progress Streaming**: Transmits real-time progress events to client browsers.
* **Payload Validation**: Confirms incoming payloads match required properties.

---

## 6. Dependencies
* **Core APIs**: Node.js route libraries (e.g. Express or Fastify).
* **AST Validation**: Coordinates directly with types defined in [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md).

---

## 7. Constraints
* **Rate Limits**: Capped at 60 compilation requests per user per hour.
* **JSON Payloads**: Requests and responses must use JSON content types (`application/json`).
* **SSE Timeout Limit**: SSE connections must close automatically after 180 seconds to conserve server resources.

---

## 8. Naming Conventions

### REST API Routes
* Root API prefix: `/api/v1`.
* Path elements: lowercase plural nouns (e.g. `/documents`, `/pages`).
* Page edit endpoint: `/api/v1/documents/:id/pages/:pageId/edit`.

---

## 9. Folder Structure
* API route configurations map to:
  * `/services/orchestrator/src/routes/` (contains route files).
  * `/services/orchestrator/src/routes/progressStream.ts` (contains SSE logic).

---

## 10. Design Decisions

### Choosing Server-Sent Events (SSE) over WebSockets
* **Decision**: We use Server-Sent Events (SSE) instead of WebSockets to stream progress updates.
* **Rationale**: Progress updates are one-directional (from backend to frontend). SSE is simpler to implement over HTTP, reconnects automatically, and handles network disruptions better than WebSockets.

---

## 11. Future Extensibility
* **New Output Formats**: Alternate formats (e.g., slideshows) can be requested by adding a format parameter to the export route (`POST /api/v1/documents/:id/export?format=epub`) without changing the core endpoints.

---

## 12. Implementation Guidance
* Map routes to controller actions.
* Enforce schema validations on request inputs using libraries like `zod`.

---

## 13. Acceptance Criteria
* The API endpoints respond with correct status codes (200, 201, 400, 404, 500).
* Request validations block invalid parameters.
* Real-time progress updates are delivered with correct payloads.

---

## 14. Common Mistakes
* **Blocking Requests**: Processing compilation tasks synchronously inside route handlers, causing browser timeout errors. Compilation must run asynchronously, using SSE to track progress.
* **Lax Validations**: Failing to validate request properties, which can cause downstream database errors.

---

## 15. Examples

### Initialize Document Request Payload
* **Endpoint**: `POST /api/v1/documents`
* **Request Body**:
```json
{
  "prompt": "Create an API best practices playbook.",
  "document_type": "Playbook",
  "page_budget": 6,
  "theme": "nordic_crisp"
}
```
* **Response (201 Created)**:
```json
{
  "document_id": "99a8f21e-128a-40a2-8930-74358c02800c",
  "status": "QUEUED",
  "current_stage": "PLANNING"
}
```

---

## 16. Decision Records

### ADR-016: Async Compilation Tasks
* **Status**: Approved.
* **Context**: Document compilation takes up to 90 seconds, which exceeds standard HTTP gateway timeouts.
* **Decision**: Make compilation asynchronous; return a document ID immediately, and stream progress via SSE.
* **Consequence**: Prevents timeout errors and improves user experience.

---

## 17. References to Related Files
* See [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md) for AST details.
* See [AI_PIPELINE.md](file:///.agent/AI_PIPELINE.md) for progress status logs.
* See [PERFORMANCE.md](file:///.agent/PERFORMANCE.md) for target latency budgets.
