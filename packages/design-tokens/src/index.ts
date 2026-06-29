/**
 * Design Token Constants
 * All tokens map to CSS custom properties defined in apps/web/src/styles/globals.css
 * Source of truth: .agent/DESIGN_SYSTEM.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// SPACING SCALE (pt-based for print fidelity)
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  xs: '3pt',
  sm: '6pt',
  md: '12pt',
  lg: '18pt',
  xl: '24pt',
  '2xl': '36pt',
  '3xl': '48pt',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY SCALE
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
  // Font families
  fonts: {
    heading: 'Outfit',
    body: 'Lora',
    mono: 'IBM Plex Mono',
  },
  // Font sizes (pt)
  sizes: {
    caption: '8pt',
    mono: '8.5pt',
    body: '10pt',
    subhead: '14pt',
    section: '20pt',
    title: '32pt',
  },
  // Line heights (pt) — must be multiples of 4pt baseline
  lineHeights: {
    caption: '12pt',
    mono: '12pt',
    body: '16pt',
    subhead: '20pt',
    section: '28pt',
    title: '40pt',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// PAGE DIMENSIONS
// ─────────────────────────────────────────────────────────────────────────────

export const pageDimensions = {
  letter: { width: 612, height: 792, unit: 'pt' },
  a4: { width: 595, height: 842, unit: 'pt' },
  legal: { width: 612, height: 1008, unit: 'pt' },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// MARGINS (pt)
// ─────────────────────────────────────────────────────────────────────────────

export const margins = {
  portrait: {
    top: 63, // 0.875in
    bottom: 72, // 1in
    outer: 54, // 0.75in
  },
  landscape: {
    top: 54,
    bottom: 63,
    outer: 72,
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// GRID
// ─────────────────────────────────────────────────────────────────────────────

export const grid = {
  columns: 12,
  gutterPt: 12, // gutter between columns
  baselinePt: 4, // baseline unit
} as const

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────

export const quality = {
  minimumScore: 90, // documents below this score are rejected
  contrastRatio: 7, // WCAG AAA
  minNegativeSpacePercent: 25, // 25% of page must be whitespace
  svgMaxSizeKb: 50, // max SVG file size
  maxCompilationMs: 90_000, // total pipeline budget
} as const

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE BUDGETS (ms)
// ─────────────────────────────────────────────────────────────────────────────

export const pipelineBudgets = {
  contentSynthesis: 40_000,
  layoutMapping: 20_000,
  pdfCompilation: 10_000,
  agentTimeout: 45_000,
  maxRetries: 3,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// BANNED WORDS (editorial quality guard)
// ─────────────────────────────────────────────────────────────────────────────

export const bannedWords = [
  'delve',
  'tapestry',
  'testament',
  'leverage',
  'synergy',
  'paradigm',
  'harness',
  'navigate',
  'transformative',
  'holistic',
  'multifaceted',
  'embark',
  'elevate',
  'cutting-edge',
  'game-changer',
  'revolutionize',
] as const
export type BannedWord = (typeof bannedWords)[number]
