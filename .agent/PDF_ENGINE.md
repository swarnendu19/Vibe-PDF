# PDF_ENGINE.md — High-Fidelity Headless PDF Compiler Specifications

This document defines the interface and settings for the Puppeteer PDF Renderer. The rendering tier takes the sandbox HTML output and outputs a compressed, print-ready PDF binary.

---

## 1. Purpose
The purpose of this document is to specify the headless browser compilation configurations for PDF output. It ensures that the PDF Compiler compiles sandbox layouts into clean PDFs that preserve metadata, colors, and fonts.

---

## 2. Goals
* Configure Puppeteer execution flags for stable, high-performance rendering.
* Ensure print stylesheets are applied correctly.
* Inject metadata attributes (title, creator, description) into the final PDF.
* Compile clickable bookmarks matching heading structures.

---

## 3. Non-Goals
* **No Element Layout Rules**: Does not handle page layouts or element margins (delegated to [PAGE_LAYOUT_ENGINE.md](file:///.agent/PAGE_LAYOUT_ENGINE.md)).
* **No Compression Logic**: Leaves asset optimization and CMYK profile rules to [EXPORT_ENGINE.md](file:///.agent/EXPORT_ENGINE.md).

---

## 4. Architecture
The PDF Compiler runs as a dedicated Node.js microservice that executes headless browser instances:

```
  HTML / CSS DOM Stream  ──►  Puppeteer API Injection  ──►  pdf-lib Meta Writer
  (From Layout Sandbox)      - setViewport (300 DPI)        - injectMetadata
                             - printBackground: true        - compileBookmarks
                                                                    │
                                                                    ▼
                                                            Final PDF Output
```

---

## 5. Responsibilities
* **Puppeteer Process Management**: Orchestrates browser pooling and execution.
* **Metadata Writer Injection**: Embeds author, title, and licensing information.
* **Outline Compilation**: Converts headings (`h1`, `h2`) into clickable bookmarks.

---

## 6. Dependencies
* **Core Libraries**: `puppeteer` (rendering), `pdf-lib` (PDF manipulation).
* **Source inputs**: Relies on [DOCUMENT_MODEL.md](file:///.agent/DOCUMENT_MODEL.md) for metadata structure.

---

## 7. Constraints
* **Chromium Args Lock**: Browser instances must run with `--disable-gpu`, `--no-sandbox`, and `--disable-dev-shm-usage` flags.
* **No Custom Browser Headers**: Default browser headers must be disabled; headers and footers are rendered inside the DOM.
* **Offline Rendering**: Network calls must be disabled after page load to secure the rendering environment.

---

## 8. Naming Conventions

### Microservices
* PDF Compiler source: `/services/compiler/src/printer.ts`.
* API path: `/api/v1/documents/:id/export`.

---

## 9. Folder Structure
* Compiler configurations map to:
  * `/services/compiler/src/` (contains compilation and process management code).

---

## 10. Design Decisions

### Headless Browser Pooling
* **Decision**: We reuse Chromium browser tabs (`BrowserContext`) from a persistent pool instead of launching a new process for each request.
* **Rationale**: Starting browser processes adds up to 1.5 seconds of latency. Tab reuse reduces compilation startup times to under 300ms.

---

## 11. Future Extensibility
* **Alternate Renderers**: Alternate HTML-to-PDF runtimes (e.g. Typst or WeasyPrint) can be added to the microservice by wrapping them in the export endpoint without affecting the orchestrator core.

---

## 12. Implementation Guidance
* Set up a browser pool class that manages active Chromium instances.
* Ensure the service waits for font assets to load before calling `page.pdf()`:
  ```javascript
  await page.evaluate(() => document.fonts.ready);
  ```

---

## 13. Acceptance Criteria
* The compiler app builds without errors.
* Output PDFs maintain accurate dimensions (A4/Letter) and layouts.
* Clickable bookmarks link correctly to their respective sections.

---

## 14. Common Mistakes
* **Process Leaks**: Failing to close tabs or processes after export errors, which causes memory leaks on the host machine.
* **Premature Rendering**: Calling `page.pdf()` before all assets and images have finished loading, leading to blank pages.

---

## 15. Examples

### Standard Puppeteer Compilation Function
```javascript
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

async function compilePDF(url, metadata) {
  const browser = await getBrowserFromPool();
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  
  const rawBuffer = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
  });
  
  await page.close();
  
  // Inject metadata using pdf-lib
  const pdfDoc = await PDFDocument.load(rawBuffer);
  pdfDoc.setTitle(metadata.title);
  pdfDoc.setAuthor(metadata.author);
  pdfDoc.setProducer("AI Publishing Engine v1.0");
  
  return await pdfDoc.save();
}
```

---

## 16. Decision Records

### ADR-013: Disabling Default Browser Headers
* **Status**: Approved.
* **Context**: Chromium's built-in print headers are not styleable, which disrupts the vertical grid rhythm.
* **Decision**: Disable the `displayHeaderFooter` setting in `page.pdf()`, and render headers/footers directly in the page DOM.
* **Consequence**: Ensures headers align perfectly with page grid layouts and typography.

---

## 17. References to Related Files
* See [PAGE_LAYOUT_ENGINE.md](file:///.agent/PAGE_LAYOUT_ENGINE.md) for DOM layout calculations.
* See [EXPORT_ENGINE.md](file:///.agent/EXPORT_ENGINE.md) for compression and profile settings.
* See [SECURITY.md](file:///.agent/SECURITY.md) for sandbox isolation configurations.
