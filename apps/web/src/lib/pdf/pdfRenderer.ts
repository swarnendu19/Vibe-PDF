/**
 * pdfRenderer.ts — DocumentAST → PDF via Puppeteer
 *
 * Renders a DocumentAST to a PDF buffer using puppeteer-core with the system
 * Chrome/Chromium executable. No bundled browser download required.
 *
 * Source: .agent/PDF_ENGINE.md, .agent/PAGE_LAYOUT_ENGINE.md
 */

import type { DocumentAST, PageNode } from '@repo/document-model'
import { THEME_PRESETS } from '@repo/document-model'

// Possible Chrome/Chromium paths on different platforms
const CHROME_PATHS = [
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

async function findChromePath(): Promise<string | undefined> {
  const { existsSync } = await import('fs')
  return CHROME_PATHS.find((p) => existsSync(p))
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export async function renderDocumentToPDF(doc: DocumentAST): Promise<Buffer> {
  const puppeteer = await import('puppeteer-core')
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || await findChromePath()

  if (!executablePath) {
    throw new Error(
      'Chrome/Chromium not found. Please install Google Chrome or set PUPPETEER_EXECUTABLE_PATH to enable PDF export.',
    )
  }

  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  try {
    const page = await browser.newPage()

    // Set viewport to US Letter at 96 DPI
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 })

    const html = buildDocumentHTML(doc)
    await page.setContent(html, { waitUntil: 'networkidle0' as any })

    const pdf = await page.pdf({
      format: doc.metadata.paperSize === 'A4' ? 'A4' : 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      displayHeaderFooter: false,
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildDocumentHTML(doc: DocumentAST): string {
  const theme = THEME_PRESETS[doc.theme.id]
  const accentHSL = `hsl(${theme.accentColor})`

  const pagesHTML = doc.pages.map((page) => renderPage(page, doc)).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(doc.metadata.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent: ${accentHSL};
    --accent-subtle: hsl(${theme.accentColor} / 0.08);
    --font-heading: '${theme.headingFont}', system-ui, sans-serif;
    --font-body: '${theme.bodyFont}', Georgia, serif;
    --font-mono: '${theme.monoFont}', monospace;
    --text-primary: ${theme.mode === 'dark' ? '#e8e8f0' : '#12181e'};
    --text-muted: ${theme.mode === 'dark' ? '#888' : '#667'};
    --bg: ${theme.mode === 'dark' ? '#0d0d14' : '#ffffff'};
    --surface: ${theme.mode === 'dark' ? '#16161f' : '#f8f9fb'};
    --border: ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  }

  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text-primary);
    font-size: 10pt;
    line-height: 1.7;
  }

  .page {
    width: 8.5in;
    min-height: 11in;
    padding: 1in;
    page-break-after: always;
    position: relative;
    background: var(--bg);
    overflow: hidden;
  }

  .page:last-child { page-break-after: avoid; }

  /* ── Typography ── */
  h1 { font-family: var(--font-heading); font-size: 32pt; font-weight: 600;
       letter-spacing: -0.02em; line-height: 1.15; color: var(--text-primary);
       margin-bottom: 16pt; }
  h2 { font-family: var(--font-heading); font-size: 20pt; font-weight: 500;
       letter-spacing: -0.01em; line-height: 1.25; color: var(--text-primary);
       margin-top: 24pt; margin-bottom: 10pt; }
  h3 { font-family: var(--font-heading); font-size: 13pt; font-weight: 500;
       line-height: 1.35; color: var(--text-primary);
       margin-top: 18pt; margin-bottom: 8pt; }
  p { margin-bottom: 10pt; orphans: 3; widows: 3; }
  p.lead { font-size: 12pt; line-height: 1.8; color: var(--text-muted); }
  p.caption { font-size: 8pt; color: var(--text-muted); font-style: italic; }

  /* ── Cover page ── */
  .layout-cover { display: flex; flex-direction: column; }
  .cover-accent-bar { width: 3.5rem; height: 3px; background: var(--accent);
                      border-radius: 2px; margin-bottom: 2.5rem; }
  .cover-eyebrow { font-family: var(--font-mono); font-size: 8pt;
                   letter-spacing: 0.12em; text-transform: uppercase;
                   color: var(--text-muted); margin-bottom: 1rem; }
  .cover-title { font-family: var(--font-heading); font-size: 38pt;
                 font-weight: 600; letter-spacing: -0.025em; line-height: 1.1;
                 color: var(--text-primary); margin-bottom: 1.5rem; }
  .cover-subtitle { font-size: 12pt; color: var(--text-muted); line-height: 1.7;
                    max-width: 75%; margin-bottom: 3rem; }
  .cover-illustration { flex: 1; display: flex; align-items: center;
                        justify-content: center; min-height: 280pt;
                        border-radius: 8pt; background: var(--accent-subtle);
                        overflow: hidden; margin-bottom: 2rem; }
  .cover-footer { display: flex; justify-content: space-between; align-items: flex-end;
                  padding-top: 1rem; border-top: 1px solid var(--border); }
  .cover-footer-brand { font-family: var(--font-heading); font-size: 9pt;
                        font-weight: 600; color: var(--text-muted); }
  .cover-footer-date { font-family: var(--font-mono); font-size: 8pt;
                       color: var(--text-muted); }

  /* ── TOC ── */
  .layout-toc h1 { margin-bottom: 2rem; }
  .toc-item { display: flex; align-items: baseline; gap: 0.5rem;
              margin-bottom: 0.75rem; }
  .toc-item-title { font-family: var(--font-body); font-size: 10.5pt; color: var(--text-primary); }
  .toc-item-dots { flex: 1; border-bottom: 1px dotted var(--border); }
  .toc-item-page { font-family: var(--font-mono); font-size: 9pt; color: var(--text-muted); }
  .toc-section-group { margin-bottom: 2rem; }
  .toc-section-label { font-family: var(--font-heading); font-size: 8pt;
                       font-weight: 600; text-transform: uppercase;
                       letter-spacing: 0.1em; color: var(--text-muted);
                       margin-bottom: 0.75rem; }

  /* ── Standard editorial ── */
  .layout-standard { }
  .page-eyebrow { font-family: var(--font-mono); font-size: 8pt;
                  letter-spacing: 0.1em; text-transform: uppercase;
                  color: var(--text-muted); margin-bottom: 0.75rem; }

  /* ── Callout / Callout blocks ── */
  .callout { border-radius: 6pt; padding: 14pt 16pt;
             margin: 16pt 0; border-left: 3px solid; }
  .callout-info { background: hsl(215 90% 52% / 0.06); border-color: hsl(215 90% 52%); }
  .callout-success { background: hsl(142 71% 45% / 0.06); border-color: hsl(142 71% 45%); }
  .callout-warning { background: hsl(38 92% 50% / 0.08); border-color: hsl(38 92% 50%); }
  .callout-insight { background: var(--accent-subtle); border-color: var(--accent); }
  .callout-label { font-family: var(--font-heading); font-size: 8.5pt;
                   font-weight: 600; text-transform: uppercase;
                   letter-spacing: 0.06em; margin-bottom: 5pt; }
  .callout-text { font-size: 9.5pt; line-height: 1.65; }

  /* ── Pull quote ── */
  .pull-quote { margin: 20pt 0; padding: 0 0 0 20pt;
                border-left: 3px solid var(--accent); }
  .pull-quote-text { font-family: var(--font-heading); font-size: 14pt;
                     font-weight: 400; font-style: italic; line-height: 1.5;
                     color: var(--text-primary); margin-bottom: 6pt; }
  .pull-quote-attribution { font-family: var(--font-mono); font-size: 8pt;
                            color: var(--text-muted); }

  /* ── Data table ── */
  table { width: 100%; border-collapse: collapse; margin: 16pt 0; font-size: 9pt; }
  thead { background: var(--accent-subtle); }
  th { font-family: var(--font-heading); font-weight: 600; padding: 8pt 10pt;
       text-align: left; border-bottom: 1px solid var(--border); font-size: 8.5pt;
       letter-spacing: 0.03em; }
  td { padding: 7pt 10pt; border-bottom: 1px solid var(--border); line-height: 1.5; }
  tr:last-child td { border-bottom: none; }

  /* ── Metrics block ── */
  .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr);
                  gap: 16pt; margin: 16pt 0; }
  .metric-card { padding: 14pt; background: var(--surface);
                 border-radius: 6pt; border: 1px solid var(--border); }
  .metric-value { font-family: var(--font-heading); font-size: 24pt;
                  font-weight: 600; color: var(--accent); line-height: 1; }
  .metric-label { font-size: 8.5pt; color: var(--text-muted);
                  margin-top: 4pt; font-family: var(--font-heading); }

  /* ── Illustration ── */
  .illustration { width: 100%; border-radius: 6pt; overflow: hidden;
                  background: var(--accent-subtle); margin: 14pt 0;
                  display: flex; align-items: center; justify-content: center; }
  .illustration svg { width: 100%; height: auto; }
  .illustration-caption { font-size: 8pt; color: var(--text-muted);
                          text-align: center; margin-top: 6pt;
                          font-family: var(--font-mono); }

  /* ── Divider ── */
  .divider { border: none; border-top: 1px solid var(--border); margin: 18pt 0; }
  .divider.thick { border-top: 2px solid var(--accent); }

  /* ── Spacer ── */
  .spacer-xs { height: 8pt; }
  .spacer-sm { height: 16pt; }
  .spacer-md { height: 24pt; }
  .spacer-lg { height: 32pt; }
  .spacer-xl { height: 48pt; }

  /* ── Two-column layout ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24pt; }

  /* ── Timeline ── */
  .timeline { margin: 16pt 0; }
  .timeline-item { display: flex; gap: 14pt; margin-bottom: 14pt; }
  .timeline-dot { width: 10pt; height: 10pt; border-radius: 50%;
                  background: var(--accent); flex-shrink: 0; margin-top: 3pt; }
  .timeline-date { font-family: var(--font-mono); font-size: 8pt;
                   color: var(--text-muted); white-space: nowrap; min-width: 60pt; }
  .timeline-title { font-family: var(--font-heading); font-weight: 500;
                    font-size: 10pt; margin-bottom: 3pt; }
  .timeline-desc { font-size: 9pt; color: var(--text-muted); line-height: 1.55; }

  /* ── Page footer ── */
  .page-footer { position: absolute; bottom: 0.5in; left: 1in; right: 1in;
                 display: flex; justify-content: space-between; align-items: center;
                 border-top: 1px solid var(--border); padding-top: 8pt; }
  .footer-brand { font-family: var(--font-heading); font-size: 7.5pt;
                  font-weight: 500; color: var(--text-muted); }
  .footer-page { font-family: var(--font-mono); font-size: 7.5pt; color: var(--text-muted); }

  @page { margin: 0; size: letter; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
${pagesHTML}
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE RENDERER
// ─────────────────────────────────────────────────────────────────────────────

function renderPage(page: PageNode, doc: DocumentAST): string {
  const layoutClass = `layout-${page.layoutVariant.replace(/_/g, '-')}`
  const elementsHTML = page.elements.map((el) => renderElement(el)).join('\n')
  const year = new Date().getFullYear()

  const isCover = page.layoutVariant === 'cover'
  const isTOC = page.layoutVariant === 'table_of_contents'

  let pageContent = ''

  if (isCover) {
    pageContent = renderCoverPage(page, doc)
  } else if (isTOC) {
    pageContent = renderTOCPage(doc)
  } else {
    pageContent = `
      <div class="page-eyebrow">${esc(doc.metadata.title)} · ${year}</div>
      ${elementsHTML}
      <div class="page-footer">
        <span class="footer-brand">PublishEngine</span>
        <span class="footer-page">${page.pageNumber}</span>
      </div>
    `
  }

  return `<div class="page ${layoutClass}">${pageContent}</div>`
}

function renderCoverPage(page: PageNode, doc: DocumentAST): string {
  const titleEl = page.elements.find((e) => e.type === 'heading')
  const subtitleEl = page.elements.find(
    (e) => e.type === 'paragraph' && e.content.emphasis === 'lead',
  )
  const illustEl = page.elements.find((e) => e.type === 'illustration')

  const title =
    titleEl?.type === 'heading' ? titleEl.content.text : doc.metadata.title
  const subtitle =
    subtitleEl?.type === 'paragraph'
      ? subtitleEl.content.text
      : doc.metadata.subtitle ?? ''
  const illustSvg =
    illustEl?.type === 'illustration' && illustEl.content.svg
      ? illustEl.content.svg
      : generateFallbackSVG()

  const year = new Date().getFullYear()

  return `
    <div class="cover-accent-bar"></div>
    <div class="cover-eyebrow">Confidential · ${year}</div>
    <div class="cover-title">${esc(title)}</div>
    <div class="cover-subtitle">${esc(subtitle)}</div>
    <div class="cover-illustration">${illustSvg}</div>
    <div class="cover-footer">
      <span class="cover-footer-brand">PublishEngine</span>
      <span class="cover-footer-date">${year}</span>
    </div>
  `
}

function renderTOCPage(doc: DocumentAST): string {
  const contentPages = doc.pages.slice(2)
  const items = contentPages.map((p) => {
    const headingEl = p.elements.find((e) => e.type === 'heading')
    const title =
      headingEl?.type === 'heading' ? headingEl.content.text : `Page ${p.pageNumber}`
    return { title, page: p.pageNumber }
  })

  const itemsHTML = items
    .map(
      (item) => `
    <div class="toc-item">
      <span class="toc-item-title">${esc(item.title)}</span>
      <span class="toc-item-dots"></span>
      <span class="toc-item-page">${item.page}</span>
    </div>`,
    )
    .join('\n')

  return `<h1>Table of Contents</h1>${itemsHTML}`
}

// ─────────────────────────────────────────────────────────────────────────────
// ELEMENT RENDERER
// ─────────────────────────────────────────────────────────────────────────────

function renderElement(el: PageNode['elements'][number]): string {
  switch (el.type) {
    case 'heading': {
      const tag = `h${el.content.level}` as 'h1' | 'h2' | 'h3'
      return `<${tag}>${esc(el.content.text)}</${tag}>`
    }

    case 'paragraph': {
      const cls = el.content.emphasis ? ` class="${el.content.emphasis}"` : ''
      return `<p${cls}>${esc(el.content.text)}</p>`
    }

    case 'callout': {
      const label = el.content.title ?? el.content.variant.toUpperCase()
      return `
        <div class="callout callout-${el.content.variant}">
          <div class="callout-label">${esc(label)}</div>
          <div class="callout-text">${esc(el.content.text)}</div>
        </div>`
    }

    case 'pull_quote':
      return `
        <div class="pull-quote">
          <div class="pull-quote-text">"${esc(el.content.text)}"</div>
          ${el.content.attribution ? `<div class="pull-quote-attribution">— ${esc(el.content.attribution)}</div>` : ''}
        </div>`

    case 'data_table': {
      const headers = el.content.headers
        .map((h) => `<th>${esc(h)}</th>`)
        .join('')
      const rows = el.content.rows
        .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
        .join('\n')
      const caption = el.content.caption
        ? `<caption class="caption">${esc(el.content.caption)}</caption>`
        : ''
      return `<table>${caption}<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`
    }

    case 'metrics_block': {
      const cards = el.content.metrics
        .map(
          (m) => `
          <div class="metric-card">
            <div class="metric-value">${esc(m.value)}${m.unit ? `<small style="font-size:0.5em;opacity:0.7"> ${esc(m.unit)}</small>` : ''}</div>
            <div class="metric-label">${esc(m.label)}</div>
          </div>`,
        )
        .join('')
      return `<div class="metrics-grid">${cards}</div>`
    }

    case 'illustration': {
      const svg = el.content.svg ?? generateFallbackSVG()
      const aspectRatio = el.content.aspectRatio ?? '16:9'
      const [w, h] = aspectRatio.split(':').map(Number)
      const paddingTop = `${((h! / w!) * 100).toFixed(1)}%`
      const caption = el.content.caption
        ? `<div class="illustration-caption">${esc(el.content.caption)}</div>`
        : ''
      return `
        <div class="illustration" style="position:relative;padding-top:${paddingTop}">
          <div style="position:absolute;inset:0;">${svg}</div>
        </div>${caption}`
    }

    case 'timeline': {
      const items = el.content.milestones
        .map(
          (m) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${esc(m.date)}</div>
            <div>
              <div class="timeline-title">${esc(m.title)}</div>
              ${m.description ? `<div class="timeline-desc">${esc(m.description)}</div>` : ''}
            </div>
          </div>`,
        )
        .join('')
      const title = el.content.title ? `<h3>${esc(el.content.title)}</h3>` : ''
      return `${title}<div class="timeline">${items}</div>`
    }

    case 'divider':
      return `<hr class="divider${el.content.style === 'thick' ? ' thick' : ''}" />`

    case 'spacer':
      return `<div class="spacer-${el.content.size}"></div>`

    default:
      return ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function generateFallbackSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" fill="none" style="width:100%;height:100%">
    <rect width="400" height="225" fill="currentColor" fill-opacity="0.04"/>
    <circle cx="200" cy="112" r="56" stroke="currentColor" stroke-opacity="0.15" stroke-width="1.5"/>
    <circle cx="200" cy="112" r="32" stroke="currentColor" stroke-opacity="0.1" stroke-width="1"/>
    <line x1="100" y1="112" x2="300" y2="112" stroke="currentColor" stroke-opacity="0.1" stroke-width="1"/>
    <line x1="200" y1="56" x2="200" y2="168" stroke="currentColor" stroke-opacity="0.1" stroke-width="1"/>
    <rect x="140" y="80" width="120" height="64" rx="4" stroke="currentColor" stroke-opacity="0.08" stroke-width="1"/>
  </svg>`
}
