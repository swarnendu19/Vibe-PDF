import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const PaperSize = z.enum(['LETTER', 'A4', 'LEGAL'])
export type PaperSize = z.infer<typeof PaperSize>

export const Orientation = z.enum(['PORTRAIT', 'LANDSCAPE'])
export type Orientation = z.infer<typeof Orientation>

export const LayoutVariant = z.enum([
  'cover',
  'table_of_contents',
  'chapter_opener',
  'standard_editorial',
  'two_column',
  'infographic',
  'data_table',
  'timeline',
  'quote_feature',
  'back_cover',
])
export type LayoutVariant = z.infer<typeof LayoutVariant>

export const ThemeId = z.enum([
  'nordic_crisp',
  'warm_editorial',
  'sleek_dark',
  'corporate_navy',
  'monochrome',
])
export type ThemeId = z.infer<typeof ThemeId>

export const DocumentType = z.enum([
  'playbook',
  'report',
  'case_study',
  'technical_docs',
  'proposal',
  'whitepaper',
])
export type DocumentType = z.infer<typeof DocumentType>

// ─────────────────────────────────────────────────────────────────────────────
// ELEMENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const HeadingElement = z.object({
  id: z.string().uuid(),
  type: z.literal('heading'),
  content: z.object({
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    text: z.string().min(1).max(300),
  }),
})
export type HeadingElement = z.infer<typeof HeadingElement>

export const ParagraphElement = z.object({
  id: z.string().uuid(),
  type: z.literal('paragraph'),
  content: z.object({
    text: z.string().min(1).max(2000),
    emphasis: z.enum(['normal', 'lead', 'caption']).optional(),
  }),
})
export type ParagraphElement = z.infer<typeof ParagraphElement>

export const CalloutElement = z.object({
  id: z.string().uuid(),
  type: z.literal('callout'),
  content: z.object({
    variant: z.enum(['info', 'warning', 'success', 'insight']),
    title: z.string().max(100).optional(),
    text: z.string().min(1).max(500),
    icon: z.string().optional(),
  }),
})
export type CalloutElement = z.infer<typeof CalloutElement>

export const PullQuoteElement = z.object({
  id: z.string().uuid(),
  type: z.literal('pull_quote'),
  content: z.object({
    text: z.string().min(1).max(300),
    attribution: z.string().max(100).optional(),
  }),
})
export type PullQuoteElement = z.infer<typeof PullQuoteElement>

export const DataTableElement = z.object({
  id: z.string().uuid(),
  type: z.literal('data_table'),
  content: z.object({
    caption: z.string().max(200).optional(),
    headers: z.array(z.string().max(100)),
    rows: z.array(z.array(z.string().max(300))),
  }),
})
export type DataTableElement = z.infer<typeof DataTableElement>

export const MetricsBlockElement = z.object({
  id: z.string().uuid(),
  type: z.literal('metrics_block'),
  content: z.object({
    metrics: z.array(
      z.object({
        label: z.string().max(80),
        value: z.string().max(50),
        unit: z.string().max(20).optional(),
        trend: z.enum(['up', 'down', 'neutral']).optional(),
      }),
    ),
  }),
})
export type MetricsBlockElement = z.infer<typeof MetricsBlockElement>

export const IllustrationElement = z.object({
  id: z.string().uuid(),
  type: z.literal('illustration'),
  content: z.object({
    description: z.string().max(500),
    svg: z.string().optional(), // populated after Illustration Agent runs
    aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2', 'wide']).optional(),
    caption: z.string().max(200).optional(),
  }),
})
export type IllustrationElement = z.infer<typeof IllustrationElement>

export const TimelineElement = z.object({
  id: z.string().uuid(),
  type: z.literal('timeline'),
  content: z.object({
    title: z.string().max(200).optional(),
    milestones: z.array(
      z.object({
        date: z.string().max(50),
        title: z.string().max(150),
        description: z.string().max(500).optional(),
      }),
    ),
  }),
})
export type TimelineElement = z.infer<typeof TimelineElement>

export const DividerElement = z.object({
  id: z.string().uuid(),
  type: z.literal('divider'),
  content: z.object({
    style: z.enum(['thin', 'thick', 'decorative']).optional(),
  }),
})
export type DividerElement = z.infer<typeof DividerElement>

export const SpacerElement = z.object({
  id: z.string().uuid(),
  type: z.literal('spacer'),
  content: z.object({
    size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']),
  }),
})
export type SpacerElement = z.infer<typeof SpacerElement>

// Union of all content elements
export const ContentElement = z.discriminatedUnion('type', [
  HeadingElement,
  ParagraphElement,
  CalloutElement,
  PullQuoteElement,
  DataTableElement,
  MetricsBlockElement,
  IllustrationElement,
  TimelineElement,
  DividerElement,
  SpacerElement,
])
export type ContentElement = z.infer<typeof ContentElement>

// ─────────────────────────────────────────────────────────────────────────────
// PAGE NODE
// ─────────────────────────────────────────────────────────────────────────────

export const PageNode = z.object({
  id: z.string().uuid(),
  pageNumber: z.number().int().min(1),
  layoutVariant: LayoutVariant,
  headerText: z.string().max(200).optional(),
  footerText: z.string().max(200).optional(),
  elements: z.array(ContentElement),
  notes: z.string().max(1000).optional(), // internal agent notes
  locked: z.boolean().optional(), // prevent canvas edits
})
export type PageNode = z.infer<typeof PageNode>

// ─────────────────────────────────────────────────────────────────────────────
// THEME CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const ThemeConfig = z.object({
  id: ThemeId,
  headingFont: z.string(),
  bodyFont: z.string(),
  monoFont: z.string(),
  accentColor: z.string(), // HSL string e.g. "215 90% 52%"
  mode: z.enum(['light', 'dark']),
})
export type ThemeConfig = z.infer<typeof ThemeConfig>

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const DocumentMetadata = z.object({
  title: z.string().min(1).max(500),
  subtitle: z.string().max(500).optional(),
  author: z.string().max(200).optional(),
  date: z.string().max(50).optional(),
  version: z.string().max(50).optional(),
  confidentiality: z.enum(['public', 'internal', 'confidential']).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  description: z.string().max(1000).optional(),
  paperSize: PaperSize,
  orientation: Orientation,
  documentType: DocumentType,
})
export type DocumentMetadata = z.infer<typeof DocumentMetadata>

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT AST (ROOT)
// ─────────────────────────────────────────────────────────────────────────────

export const DocumentAST = z.object({
  id: z.string().uuid(),
  schemaVersion: z.literal('1.0.0'),
  metadata: DocumentMetadata,
  theme: ThemeConfig,
  pages: z.array(PageNode).min(1).max(100),
  generatedAt: z.string().datetime().optional(),
  promptUsed: z.string().max(5000).optional(),
})
export type DocumentAST = z.infer<typeof DocumentAST>

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const PipelineStage = z.enum([
  'PENDING',
  'PLANNING',
  'RESEARCHING',
  'OUTLINING',
  'WRITING',
  'ILLUSTRATING',
  'TYPOGRAPHY',
  'LAYOUT',
  'QA',
  'EXPORTING',
  'COMPLETE',
  'FAILED',
])
export type PipelineStage = z.infer<typeof PipelineStage>

export const GenerationJob = z.object({
  jobId: z.string().uuid(),
  documentId: z.string().uuid(),
  userId: z.string(),
  prompt: z.string().min(10).max(5000),
  documentType: DocumentType,
  pageBudget: z.number().int().min(2).max(50),
  themeId: ThemeId,
  stage: PipelineStage,
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type GenerationJob = z.infer<typeof GenerationJob>

export const SSEProgressEvent = z.object({
  jobId: z.string().uuid(),
  documentId: z.string().uuid(),
  stage: PipelineStage,
  progress: z.number().min(0).max(100),
  message: z.string().max(500),
  timestamp: z.string().datetime(),
})
export type SSEProgressEvent = z.infer<typeof SSEProgressEvent>

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS EDITOR TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const CanvasAction = z.enum([
  'EDIT_TEXT',
  'SWAP_THEME',
  'REORDER_PAGES',
  'DUPLICATE_PAGE',
  'DELETE_PAGE',
  'REGENERATE_PAGE',
])
export type CanvasAction = z.infer<typeof CanvasAction>

export const PageEditCommand = z.object({
  documentId: z.string().uuid(),
  pageId: z.string().uuid(),
  action: CanvasAction,
  payload: z.record(z.unknown()).optional(),
  userInstruction: z.string().max(1000).optional(),
})
export type PageEditCommand = z.infer<typeof PageEditCommand>

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY AUDIT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const QualityCheckResult = z.object({
  documentId: z.string().uuid(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  checks: z.array(
    z.object({
      category: z.enum([
        'typography',
        'layout',
        'readability',
        'visual_hierarchy',
        'color_contrast',
        'accessibility',
        'print_readiness',
        'spacing',
        'editorial_quality',
      ]),
      score: z.number().min(0).max(10),
      passed: z.boolean(),
      issues: z.array(z.string()).optional(),
    }),
  ),
  rejectionReason: z.string().optional(),
})
export type QualityCheckResult = z.infer<typeof QualityCheckResult>

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function createEmptyDocument(
  overrides?: Partial<Pick<DocumentAST, 'metadata' | 'theme'>>,
): Omit<DocumentAST, 'id' | 'pages'> {
  return {
    schemaVersion: '1.0.0',
    metadata: {
      title: 'Untitled Document',
      paperSize: 'LETTER',
      orientation: 'PORTRAIT',
      documentType: 'report',
      ...overrides?.metadata,
    },
    theme: {
      id: 'nordic_crisp',
      headingFont: 'Outfit',
      bodyFont: 'Lora',
      monoFont: 'IBM Plex Mono',
      accentColor: '215 90% 52%',
      mode: 'light',
      ...overrides?.theme,
    },
  }
}

export const THEME_PRESETS: Record<ThemeId, ThemeConfig> = {
  nordic_crisp: {
    id: 'nordic_crisp',
    headingFont: 'Outfit',
    bodyFont: 'Lora',
    monoFont: 'IBM Plex Mono',
    accentColor: '215 90% 52%',
    mode: 'light',
  },
  warm_editorial: {
    id: 'warm_editorial',
    headingFont: 'Playfair Display',
    bodyFont: 'Source Serif 4',
    monoFont: 'Fira Code',
    accentColor: '25 80% 48%',
    mode: 'light',
  },
  sleek_dark: {
    id: 'sleek_dark',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
    accentColor: '263 85% 68%',
    mode: 'dark',
  },
  corporate_navy: {
    id: 'corporate_navy',
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    monoFont: 'IBM Plex Mono',
    accentColor: '222 72% 32%',
    mode: 'light',
  },
  monochrome: {
    id: 'monochrome',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    monoFont: 'Roboto Mono',
    accentColor: '0 0% 10%',
    mode: 'light',
  },
}
