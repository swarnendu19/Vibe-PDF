# COLOR_SYSTEM.md — Semantic Palette & Print-Safe Specifications

This document defines the color tokens, light and dark themes, print-safe profiles, and color schemas for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the color system for generated documents. It enables themes to be swapped globally without modifying individual components, and handles color transformations for physical print output.

---

## 2. Goals
* Define semantic color tokens mapped to light and dark theme configurations.
* Ensure all text combinations maintain WCAG AAA contrast standards (7:1).
* Provide print-safe CMYK conversions to prevent muddy color outcomes during printing.
* Establish monochrome fallback profiles.

---

## 3. Non-Goals
* **No Layout Dimensions**: Leaves grid spacing and margins to [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md).
* **No Vector Asset Formatting**: Leaves specific SVG code shapes to [ILLUSTRATION_SYSTEM.md](file:///.agent/ILLUSTRATION_SYSTEM.md).

---

## 4. Architecture
The color system maps variables to semantic roles across light and dark modes:

```
┌─────────────────────────────────────────────────────────┐
│                    THEMATIC COLOR MAP                   │
├───────────────────┬───────────────────┬─────────────────┤
│ Token             │ Light Mode        │ Dark Mode       │
├───────────────────┼───────────────────┼─────────────────┤
│ --bg-primary      │ Nordic White      │ Charcoal Dark   │
│ --bg-secondary    │ Light Gray        │ elevated surface│
│ --text-primary    │ Charcoal Black    │ Paper White     │
│ --accent-primary  │ Nordic Blue       │ Stellar Violet  │
└───────────────────┴───────────────────┴─────────────────┘
```

---

## 5. Responsibilities
* **Theme Switching**: Binds semantic tokens dynamically depending on the selected user theme.
* **Contrast Compliance**: Blocks combinations that fail the contrast check.
* **Print Color Optimization**: Swaps digital RGB variables for print-safe values when compiling physical PDFs.

---

## 6. Dependencies
* **Component Styling**: Integrates with [COMPONENT_LIBRARY.md](file:///.agent/COMPONENT_LIBRARY.md) to style components.
* **Asset Theme Mapping**: Provides color mappings to [ILLUSTRATION_SYSTEM.md](file:///.agent/ILLUSTRATION_SYSTEM.md).

---

## 7. Constraints
* **Contrast Threshold**: Primary paragraph and header colors must maintain a contrast ratio of at least 7:1 against background canvases.
* **Pure Black on Small Text**: Small body text (under `12pt`) must map to absolute black (`C:0 M:0 Y:0 K:100`) for print compilation to prevent ink alignment failures.
* **Hex Color Lock**: Hardcoded hex color codes are banned inside components and SVGs; everything must reference CSS variables.

---

## 8. Naming Conventions

### Colors
* Background tokens: `--bg-primary`, `--bg-secondary`.
* Text tokens: `--text-primary`, `--text-muted`.
* Accent and alerts: `--accent-primary`, `--border-thin`, `--alert-success`, `--alert-danger`.

---

## 9. Folder Structure
* Color theme variables map to:
  * `/apps/layout_sandbox/src/styles/colors.css` (contains color variables and theme maps).

---

## 10. Design Decisions

### Choosing HSL Color Mapping
* **Decision**: We define all colors in HSL formats rather than Hex or RGB values.
* **Rationale**: HSL makes it easy to adjust brightness, saturation, and contrast. For example, generating dark/light mode alternatives or hover state offsets is straightforward when using HSL properties.

---

## 11. Future Extensibility
* **New Color Themes**: Custom themes (e.g. Corporate Navy) can be added to the styles sheet by mapping properties to the semantic variables without changing component classes.

---

## 12. Implementation Guidance
* Map all colors to CSS variable declarations.
* Configure the print compiler stylesheet to override digital RGB variables with print-safe CMYK mappings.

---

## 13. Acceptance Criteria
* The layout app compiles and supports swapping themes at runtime.
* Contrast checks return zero failures on body paragraphs.
* Print output scans show that small body text maps to pure black.

---

## 14. Common Mistakes
* **Hardcoded Hex Values**: Writing HEX colors (`#FF0000`) inside components, which breaks theme support.
* **Saturated Backgrounds**: Using highly saturated accent colors for background elements, which degrades readability.

---

## 15. Examples

### Semantic Variable Maps
```css
/* Nordic Crisp Theme */
.theme-nordic-crisp {
  --bg-primary: hsl(210, 20%, 98%);
  --bg-secondary: hsl(210, 16%, 93%);
  --text-primary: hsl(210, 24%, 12%);
  --text-muted: hsl(210, 12%, 40%);
  --accent-primary: hsl(215, 90%, 52%);
  --border-thin: hsl(210, 14%, 85%);
}

/* Page styling injection */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## 16. Decision Records

### ADR-008: CMYK Profile Injections
* **Status**: Approved.
* **Context**: Digital RGB colors do not map directly to print inks, leading to washed-out or oversaturated prints.
* **Decision**: Programmatically inject a standard ICC color profile (`Coated FOGRA39`) during print-profile compile steps.
* **Consequence**: Ensures accurate color translation from screen to physical paper.

---

## 17. References to Related Files
* See [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md) for grid margin details.
* See [ILLUSTRATION_SYSTEM.md](file:///.agent/ILLUSTRATION_SYSTEM.md) for SVG color mappings.
* See [EXPORT_ENGINE.md](file:///.agent/EXPORT_ENGINE.md) for compile profile details.
