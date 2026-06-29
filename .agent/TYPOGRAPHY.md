# TYPOGRAPHY.md — Publication Typography & Hierarchy Specification

This document defines the typography settings, font pairing choices, and hierarchy scales for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the typography rules for generated documents. It ensures that the Layout Sandbox renders text with consistent hierarchy, readability, and correct line alignments.

---

## 2. Goals
* Define font pairing configurations for different document tones.
* Establish a point-based typography scale aligned to the baseline grid.
* Set constraints on character counts and column widths.
* Provide CSS rules to prevent widows, orphans, and heading wraps.

---

## 3. Non-Goals
* **No Color Variables**: Does not define specific font colors or surface colors (delegated to [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md)).
* **No Element Interface Details**: Leaves spacing between elements to [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md).

---

## 4. Architecture
The typography scale relies on a major-third mathematical scale:

```
+─────────────────────────────────────────────────────────+
|               TYPOGRAPHIC HIERARCHY                     |
├─────────────────────────────────────────────────────────┤
│ Title (32pt / 40pt line-height) - Outfit (Semi-Bold)    │
│ Section (20pt / 28pt line-height) - Outfit (Medium)     │
│ Subhead (14pt / 20pt line-height) - Outfit (Regular)    │
│ Body Text (10pt / 16pt line-height) - Lora (Serif)      │
│ Monospace (8.5pt / 12pt line-height) - IBM Plex Mono    │
+─────────────────────────────────────────────────────────+
```

---

## 5. Responsibilities
* **Hierarchy Enforcement**: Maps AST heading levels (`h1`, `h2`, `h3`) to correct CSS size tokens.
* **Layout Integrity**: Verifies line-heights are multiples of the `4pt` baseline.
* **Accessibility Compliance**: Confirms readability and contrast standards are met.

---

## 6. Dependencies
* **Grid Alignments**: Relies on [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for baseline alignment rules.
* **Render Pipeline**: Integrates with [PAGE_LAYOUT_ENGINE.md](file:///.agent/PAGE_LAYOUT_ENGINE.md) for element height checks.

---

## 7. Constraints
* **Baseline Lock**: All line-height values must be exact multiples of the `4pt` baseline unit.
* **Font Formats**: All fonts must be loaded locally from WOFF2 formats; external URL imports are blocked for security.
* **Widow/Orphan Limits**: Any text block pushed to a new page must contain a minimum of two lines.

---

## 8. Naming Conventions

### Typographic Scales
* `font-size-title`: `32pt`
* `font-size-section`: `20pt`
* `font-size-subhead`: `14pt`
* `font-size-body`: `10pt`
* `font-size-caption`: `8pt`
* `font-size-monospace`: `8.5pt`

---

## 9. Folder Structure
* Font assets and variables map to:
  * `/apps/layout_sandbox/src/assets/fonts/` (contains font files).
  * `/apps/layout_sandbox/src/styles/typography.css` (contains typography rules).

---

## 10. Design Decisions

### Embedding Local WOFF2 Files
* **Decision**: We bundle WOFF2 font files locally within the layout application, blocking external Google Fonts calls.
* **Rationale**: External HTTP calls introduce latency and can fail in offline runtimes. Bundling files locally ensures stable builds and consistent rendering metrics.

---

## 11. Future Extensibility
* **New Font Pairings**: Custom type profiles (e.g. corporate sans-serif pairings) can be added to the stylesheet variables without affecting layout measurements, provided the line-height alignments are preserved.

---

## 12. Implementation Guidance
* Set up the global stylesheet to define typography classes.
* Configure Puppeteer to wait for font loading before compiling documents:
  ```javascript
  await page.evaluate(() => document.fonts.ready);
  ```

---

## 13. Acceptance Criteria
* The layout app compiles without errors.
* Baseline alignment tests pass for multi-column text blocks.
* Document compilations resolve zero orphans or widows.

---

## 14. Common Mistakes
* **Line-height Drifts**: Using decimal line-height multipliers (e.g., `line-height: 1.5;`), which breaks baseline alignments on longer pages.
* **Web-Scale Metrics**: Using relative web metrics (`em` or `%`) for document headings, leading to scaling inconsistencies during compile steps.

---

## 15. Examples

### Global Typography Variables in CSS
```css
:root {
  --font-family-header: 'Outfit', sans-serif;
  --font-family-body: 'Lora', serif;
  --font-family-mono: 'IBM Plex Mono', monospace;
  
  --font-size-h1: 32pt;
  --font-line-height-h1: 40pt;
  
  --font-size-body: 10pt;
  --font-line-height-body: 16pt;
}

p {
  font-family: var(--font-family-body);
  font-size: var(--font-size-body);
  line-height: var(--font-line-height-body);
  margin-bottom: var(--spacing-md);
  orphans: 3;
  widows: 3;
}
```

---

## 16. Decision Records

### ADR-007: Outlined Heading Break Protection
* **Status**: Approved.
* **Context**: Headings placed at the bottom of pages look amateurish and disrupt reading flow.
* **Decision**: Apply `break-after: avoid` to all headings (`h1`, `h2`, `h3`).
* **Consequence**: Forces the layout engine to push headings to the next page if there is no room for the following paragraph text.

---

## 17. References to Related Files
* See [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for baseline spacing details.
* See [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md) for color variable integration.
* See [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md) for Puppeteer font loading rules.
