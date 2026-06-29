# EXPORT_ENGINE.md — Compression, Print Bleeds, & Accessibility Tagging

This document defines the export processing rules, bleed setups, color spaces, and compression levels for the AI Publishing Engine.

---

## 1. Purpose
The purpose of this document is to specify the output processing rules. It ensures that the Exporter Agent optimizes compiled PDFs for their target destinations (digital web or physical print).

---

## 2. Goals
* Define Web-Optimized and Print-Ready export profiles.
* Implement print safety settings (trim boundaries, bleed boxes, crop marks).
* Optimize output file size using vector path simplification and font subsetting.
* Generate accessible documents that meet PDF/A-3a guidelines.

---

## 3. Non-Goals
* **No PDF Rendering**: Leaves browser execution and page printing to [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md).
* **No Layout Calculations**: Leaves page spacing to [PAGE_LAYOUT_ENGINE.md](file:///.agent/PAGE_LAYOUT_ENGINE.md).

---

## 4. Architecture
The Exporter Agent processes the raw PDF buffer inside the compilation service:

```
  Raw PDF Buffer  ──►  Exporter Agent Action  ──►  Output PDF Binary
  (From Puppeteer)     - Apply Bleed / Crop Box    - Web Profile (RGB)
                       - Font Subsetting           - Print Profile (CMYK)
                       - PDF/A-3a XML Tagging
```

---

## 5. Responsibilities
* **Profile Swapping**: Configures settings based on the selected export profile.
* **Asset Optimization**: Compresses vectors and subsets embedded fonts.
* **Tag Injection**: Embeds accessibility tags and structure reading order.

---

## 6. Dependencies
* **Core Libraries**: `pdf-lib` (PDF manipulation).
* **Render Pipeline**: References configurations defined in [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md).

---

## 7. Constraints
* **Bleed Margin**: Print-Ready profiles must expand the page by exactly `0.125 in` (9pt) on all sides.
* **Text Ink Separation**: Small body text must map to absolute black (`C:0 M:0 Y:0 K:100`) for print.
* **No Raster Resampling Loss**: Vector layouts must not be converted to raster images during compression.

---

## 8. Naming Conventions

### Export Profiles
* Profile keys: `WEB_OPTIMIZED`, `PRINT_READY`.
* File metadata suffix: `[title]_web.pdf`, `[title]_print.pdf`.

---

## 9. Folder Structure
* Export logic maps to:
  * `/services/compiler/src/exporter.ts` (contains export profile and compression code).

---

## 10. Design Decisions

### Web-Optimized vs. Print-Ready Profiles
* **Decision**: We create two distinct export profiles (Web-Optimized in RGB and Print-Ready in CMYK with bleed).
* **Rationale**: Web profiles need to be small and fast to load, using RGB colors. Print profiles require high-resolution assets, CMYK colors, and bleed boundaries to prevent edge gaps during physical cutting.

---

## 11. Future Extensibility
* **New Output Formats**: Alternate formats (e.g. ePUB) can be added to the export engine by creating a format handler without changing the core PDF profiles.

---

## 12. Implementation Guidance
* Map export options to API configurations.
* Use `pdf-lib` to write metadata dictionaries and accessibility tags:
  ```javascript
  const pdfDoc = await PDFDocument.load(rawBuffer);
  pdfDoc.setTitle(metadata.title);
  ```

---

## 13. Acceptance Criteria
* Output PDF files match selected profile settings.
* Print profiles contain bleed margins and crop marks.
* Exported PDFs pass accessibility verification tests.

---

## 14. Common Mistakes
* **Halo Effects**: Small text rendered with mixed colors in print profiles, leading to printing misalignment.
* **Missing Alt Text**: Exporting illustrations without alt text tags, which fails accessibility checks.

---

## 15. Examples

### Export Configuration Schema
```json
{
  "document_id": "99a8f21e-128a-40a2-8930-74358c02800c",
  "export_settings": {
    "profile": "PRINT_READY",
    "bleed_enabled": true,
    "cmyk_profile": "Coated FOGRA39",
    "compression": {
      "subset_fonts": true,
      "raster_dpi_limit": 300
    }
  }
}
```

---

## 16. Decision Records

### ADR-022: Font Subsetting
* **Status**: Approved.
* **Context**: Bundling entire font files (which can be several megabytes) inside PDFs leads to large file sizes.
* **Decision**: Extract and embed only the glyphs used in the document text.
* **Consequence**: Reduces output file sizes by up to 80% while preserving typography rendering.

---

## 17. References to Related Files
* See [PDF_ENGINE.md](file:///.agent/PDF_ENGINE.md) for compilation details.
* See [COLOR_SYSTEM.md](file:///.agent/COLOR_SYSTEM.md) for print-safe colors.
* See [QUALITY_STANDARD.md](file:///.agent/QUALITY_STANDARD.md) for QA checklists.
