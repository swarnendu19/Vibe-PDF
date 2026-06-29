# BRAND_GUIDELINES.md — Voice, Logo, & Editorial Tone

This document defines the brand voice, editorial tone guidelines, logo rules, and visual style constraints for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the brand guidelines for document generation. It ensures that the Writer and Design agents produce content and layouts that maintain a consistent, premium brand identity.

---

## 2. Goals
* Standardize the brand tone of voice (Professional, Editorial, Authoritative).
* Enforce rules for logo positioning and sizing.
* Define margins and visual limits for brand logo placements.
* Establish copywriting guidelines that avoid common chatbot clichés.

---

## 3. Non-Goals
* **No Database Migrations**: Leaves persistence mappings to [DATABASE_SCHEMA.md](file:///.agent/DATABASE_SCHEMA.md).
* **No Specific Styling Tokens**: Leaves design tokens to [DESIGN_SYSTEM.md](file:///.agent/DESIGN_SYSTEM.md).

---

## 4. Architecture
The brand voice and identity guidelines shape both the copy and visual assets produced by the agents:

```
  Document Intent  ──►  Copy Generation  ──►  Editorial Check  ──►  DOM Page Render
                        - Voice parameters    - Brand compliance    - Logo placement
                        - Tone filter         - Jargon scan         - Theme color mapping
```

---

## 5. Responsibilities
* **Voice Compliance**: Ensures all generated copy matches the target editorial tone.
* **Asset Sizing Auditing**: Confirms logo placements adhere to margin constraints.
* **Vocabulary Scanning**: Checks for and removes restricted words and jargon.

---

## 6. Dependencies
* **Color Schemes**: Relies on color variables defined in [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md).
* **Typographic Styles**: Coordinates with typography rules defined in [TYPOGRAPHY.md](file:///.agent/TYPOGRAPHY.md).

---

## 7. Constraints
* **Brand Logo Safe Area**: Logos must preserve a safe margin of at least `0.25 in` (18pt) around their borders.
* **Banned Words List**: Copywriting must contain zero instances of restricted chatbot jargon (e.g. `delve`, `tapestry`, `testament`).
* **Cover Page Branding**: Every cover page layout must place the brand logo at the top left margin.

---

## 8. Naming Conventions

### Brand Assets
* Logo file names: `brand-logo-primary.svg`, `brand-logo-reverse.svg`.
* Theme color profiles: `light_mode_brand`, `dark_mode_brand`.

---

## 9. Folder Structure
* Brand assets and guidelines map to:
  * `/apps/layout_sandbox/src/assets/brand/` (contains vector brand assets).

---

## 10. Design Decisions

### Enforced Left-Margin Logo Placement
* **Decision**: Lock the brand logo placement to the top-left margin on all cover templates.
* **Rationale**: Top-left alignment is standard in premium publications (e.g. Stripe guides). It establishes a consistent reading start point and keeps layouts looking clean.

---

## 11. Future Extensibility
* **White-Labeling Support**: The brand logo paths can be mapped to variables to support custom customer branding in future releases, without changing the layout template structures.

---

## 12. Implementation Guidance
* Store brand vectors in the assets directory.
* Run the text scanner check on all generated copy before calling layout steps.

---

## 13. Acceptance Criteria
* The logo file renders correctly on the cover page.
* Generated copy passes tone validation scans.
* Margin configurations conform to the brand rules.

---

## 14. Common Mistakes
* **Centered Logos**: Centering the brand logo on the cover page, which breaks the asymmetric grid system.
* **Jargon Inclusions**: Allowing chatbot jargon to pass validation, which degrades the editorial tone.

---

## 15. Examples

### Tone Audit Rules
* **Input Text**: "This document will delve into the tapestry of APIs, serving as a testament to Stripe's developer-first integration system."
* **Audit Failure**: "Banned words detected: 'delve', 'tapestry', 'testament'."
* **Corrected Copy**: "This document details the API integration patterns that support Stripe's developer system."

---

## 16. Decision Records

### ADR-026: Restricting Visual Overlays
* **Status**: Approved.
* **Context**: Placing semi-transparent color overlays over logos can make them look muddy.
* **Decision**: Prohibit the use of color filters or opacity modifications on brand logos.
* **Consequence**: Keeps the logo presentation clean and consistent across all themes.

---

## 17. References to Related Files
* See [DESIGN_PRINCIPLES.md](file:///.agent/DESIGN_PRINCIPLES.md) for grid balance rules.
* See [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md) for color tokens.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for validation details.
