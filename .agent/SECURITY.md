# SECURITY.md — Sandbox Isolation & SVG Sanitization Protocols

This document defines the security parameters, sandbox settings, SVG sanitization rules, and CORS configurations for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the security rules and sandbox settings of the system. It ensures that the application prevents XSS injections, SSRF attacks, and unauthorized access to data.

---

## 2. Goals
* Sanitize all user and agent-provided SVG files to prevent script injections.
* Lock down the Puppeteer rendering environment to prevent SSRF vulnerabilities.
* Enforce strict CORS policies to protect access to assets and endpoints.
* Restrict execution permissions for microservices.

---

## 3. Non-Goals
* **No Authentication Logic**: Does not define specific user authentication flows or credentials (e.g. Auth0 setup).
* **No Database Migrations**: Leaves schema persistence mappings to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).

---

## 4. Architecture
The security system restricts browser environments and sanitizes all vector strings:

```
  SVG Asset String ──► [DOMPurify Sanitizer] ──► Clean SVG Code ──► Sandbox Render
                         - Blocks scripts tags                      - Network disabled
                         - Strips remote links                      - No local file access
```

---

## 5. Responsibilities
* **SVG Sanitization Management**: Strips script tags, event handlers, and external references from SVG inputs.
* **Sandbox Configuration**: Enforces security constraints on headless browser processes.
* **CORS Controls**: Restricts API access to authorized domains.

---

## 6. Dependencies
* **Core Libraries**: `dompurify` (sanitization), Node.js configurations defined in [TECH_STACK.md](file:///.agent/TECH_STACK.md).
* **API Endpoints**: Coordinates with access rules configured in [API_SPEC.md](file:///.agent/API_SPEC.md).

---

## 7. Constraints
* **Puppeteer Isolation**: Browser processes must run with `--disable-gpu`, `--no-sandbox`, and `--disable-dev-shm-usage` flags.
* **Network Block**: Browser contexts must disable external networking once page assets are loaded.
* **CORS Limits**: API endpoints must restrict access to verified application domains.

---

## 8. Naming Conventions

### Settings
* Environment variables: `CORS_ALLOWED_ORIGINS`, `PUPPETEER_DISABLE_NETWORK`.

---

## 9. Folder Structure
* Security settings and sanitization filters map to:
  * `/services/compiler/src/security/` (contains sanitization and isolation scripts).

---

## 10. Design Decisions

### Enforcing SVG Sanitization
* **Decision**: We run all user and agent-provided SVGs through `DOMPurify` before injecting them into the DOM.
* **Rationale**: SVGs can contain script tags or event handlers that run when rendered in browser environments. Sanitizing them prevents cross-site scripting (XSS) attacks.

---

## 11. Future Extensibility
* **Adding Security Filters**: Custom sanitization rules or origin filters can be added to the configurations without changing existing rendering modules.

---

## 12. Implementation Guidance
* Set up sanitization checks for all incoming vector assets.
* Configure Puppeteer to block requests to local host addresses or internal IP metadata ranges.

---

## 13. Acceptance Criteria
* The application runs compile steps successfully within the secure sandbox.
* SVG files containing script tags are rejected.
* External network requests are blocked during PDF compilation steps.

---

## 14. Common Mistakes
* **Lax Sandbox Settings**: Running Puppeteer without proper isolation settings, which can expose host machine resources.
* **Ignoring SVGs**: Rendering vector assets directly without sanitizing them, risking script injection vulnerabilities.

---

## 15. Examples

### DOMPurify Sanitization Routine
```typescript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export function sanitizeSVG(svgContent: string): string {
  return purify.sanitize(svgContent, {
    USE_PROFILES: { svg: true },
    ADD_TAGS: ['use'],
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe'],
    FORBID_ATTR: ['onload', 'onclick', 'onerror']
  });
}
```

---

## 16. Decision Records

### ADR-028: Blocking Local Host Access
* **Status**: Approved.
* **Context**: Headless browsers can be exploited to request internal resources (SSRF).
* **Decision**: Configure Puppeteer to block all requests to local addresses (e.g. `localhost`, `127.0.0.1`, `169.254.169.254`).
* **Consequence**: Protects internal services from SSRF attacks.

---

## 17. References to Related Files
* See [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md) for compilation details.
* See [API_SPEC.md](file:///.agent/API_SPEC.md) for origin configurations.
* See [ERROR_HANDLING.md](file:///.agent/ERROR_HANDLING.md) for error codes.
