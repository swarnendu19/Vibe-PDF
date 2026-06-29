# ICON_SYSTEM.md — SVG Icon Architecture & Placement Rules

This document specifies the icon design, sizing, viewBox, and embedding constraints for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to define the icon integration standards. It ensures that the system uses only clean, responsive, SVG-based icons that scale cleanly without pixelation or rendering overhead.

---

## 2. Goals
* Standardize on a strictly SVG-only icon delivery format.
* Enforce color inheritance using `currentColor` so icons match the active theme.
* Define an icon scale mapped to layout spacing.
* Restrict SVG code to clean, vector-only path coordinates.

---

## 3. Non-Goals
* **No Raster Formats**: We will not support PNG, JPEG, or GIF formats for visual icons.
* **No Icon Fonts**: Standard font formats like FontAwesome or WebFonts are banned.

---

## 4. Architecture
The Icon System registers SVGs inside a modular database catalog, loading them dynamically into page layouts:

```
  Document Content AST  ──►  Icon Registry Hook  ──►  DOM Node Wrapper
  { "icon": "settings" }      "settings" matches:       <svg class="api-icon">
                              SVG path definition       <path d="..."/>
```

---

## 5. Responsibilities
* **Icon Registry Management**: Provides mappings between icon names and SVG path code.
* **SVG Ingestion Sanitization**: Automatically strips scripts, inline styles, and unneeded tags.
* **Inline Text Alignment**: Ensures icons center cleanly with line text.

---

## 6. Dependencies
* **Color System integration**: Inherits color settings from [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md).
* **Security Validation**: Relies on [SECURITY.md](file:///.agent/SECURITY.md) for XSS sanitization checks.

---

## 7. Constraints
* **viewBox Boundary**: All icons must be compiled inside a standard `"0 0 24 24"` viewport.
* **No Hardcoded Colors**: SVG fills and strokes must use `currentColor` to dynamically support theme changes.
* **No External Resources**: Icons must be self-contained vector paths; no external HTTP links are allowed inside the code.

---

## 8. Naming Conventions

### Icon Assets
* File Names: lowercase kebab-case (e.g., `chevron-right.svg`, `file-text.svg`).
* CSS Class Hooks: `api-icon`, `api-icon-inline`.

---

## 9. Folder Structure
* Icon codes map to:
  * `/apps/layout_sandbox/src/assets/icons/` (contains clean SVG icon assets).

---

## 10. Design Decisions

### Choosing SVG Paths over Icon Fonts
* **Decision**: We use inline SVG paths instead of custom font files (e.g. `.woff` or `.ttf`).
* **Rationale**: Icon fonts introduce rendering latency, anti-aliasing issues at print scales, and layout shift. SVG paths render instantly, scale perfectly for high-resolution printing, and allow precise styling via CSS.

---

## 11. Future Extensibility
* **Dynamic Registries**: Developers can register new icons by adding SVG paths to the database catalog without having to compile custom font files or update structural code.

---

## 12. Implementation Guidance
* Store all icons in a central registry file.
* Use CSS flex alignment to center icons inline with text.

---

## 13. Acceptance Criteria
* The layout app compiles successfully.
* Swapping themes dynamically updates icon colors.
* Ingested SVG strings do not contain scripts or style tags.

---

## 14. Common Mistakes
* **Figma Metadata**: Copy-pasting SVG coordinates directly from design exports (e.g., Illustrator) without stripping proprietary XML namespaces.
* **Hardcoded Heights**: Setting pixel dimensions (`width="24px"`) inside the SVG tag, which overrides CSS scaling rules.

---

## 15. Examples

### Standard Inline SVG Icon Component
```xml
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 24 24" 
  width="1em" 
  height="1em" 
  fill="none" 
  stroke="currentColor" 
  stroke-width="1.5" 
  stroke-linecap="round" 
  stroke-linejoin="round"
  class="api-icon api-icon-inline"
  aria-hidden="true"
>
  <line x1="12" y1="5" x2="12" y2="19" />
  <line x1="5" y1="12" x2="19" y2="12" />
</svg>
```

---

## 16. Decision Records

### ADR-009: Strict DOMPurify Sanitization
* **Status**: Approved.
* **Context**: User-provided SVG files could contain malicious script tags that compromise the sandboxed rendering environment.
* **Decision**: Run all custom SVGs through `DOMPurify` before compiling them.
* **Consequence**: Prevents security breaches and script injections while maintaining clean rendering paths.

---

## 17. References to Related Files
* See [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md) for color variables.
* See [SECURITY.md](file:///.agent/SECURITY.md) for sanitization rules.
* See [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md) for asset mapping tables.
