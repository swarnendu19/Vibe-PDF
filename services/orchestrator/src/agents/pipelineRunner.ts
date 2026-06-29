/**
 * pipelineRunner.ts — Core AI Pipeline Coordinator
 *
 * Orchestrates the multi-agent document generation pipeline.
 * Agents: Planner → Research → Outline → Writer → Illustrator → Layout → QA → Export
 */

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { THEME_PRESETS } from '@repo/document-model'
import type { DocumentAST, PageNode, ThemeId } from '@repo/document-model'
import { JobRecord, saveJob, getJob } from '../database/db'

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE STAGE WEIGHTS (must sum to 100)
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_WEIGHTS: Record<string, number> = {
  PLANNING: 8,
  RESEARCHING: 12,
  OUTLINING: 10,
  WRITING: 35,
  ILLUSTRATING: 10,
  LAYOUT: 10,
  QA: 8,
  EXPORTING: 7,
}

export function progressAt(stage: string, fraction = 1): number {
  const stages = Object.keys(STAGE_WEIGHTS)
  const idx = stages.indexOf(stage)
  if (idx === -1) return 0
  const prior = stages.slice(0, idx).reduce((s, k) => s + STAGE_WEIGHTS[k]!, 0)
  const current = STAGE_WEIGHTS[stage]! * fraction
  return Math.round(prior + current)
}

async function updateJob(
  jobId: string,
  patch: Partial<JobRecord>,
) {
  const job = await getJob(jobId)
  if (job) {
    Object.assign(job, patch)
    await saveJob(job)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL
// ─────────────────────────────────────────────────────────────────────────────

const model = google('gemini-2.0-flash-001')

async function callAgent(systemPrompt: string, userPrompt: string): Promise<string> {
  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 8192,
  } as any)
  return text
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

export async function runPipeline(
  job: JobRecord,
): Promise<void> {
  const { jobId, prompt, documentType, pageBudget, theme } = job

  try {
    // ── STAGE 1: PLANNING ────────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'PLANNING', status: 'RUNNING', progress: 2 })

    const planText = await callAgent(
      PLANNER_SYSTEM,
      `Document type: ${documentType}\nPage budget: ${pageBudget}\nUser prompt: ${prompt}`,
    )

    await updateJob(jobId, { progress: progressAt('PLANNING') })

    // ── STAGE 2: RESEARCHING ─────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'RESEARCHING', progress: progressAt('PLANNING') + 2 })

    const researchText = await callAgent(
      RESEARCH_SYSTEM,
      `Plan:\n${planText}\n\nUser prompt: ${prompt}`,
    )

    await updateJob(jobId, { progress: progressAt('RESEARCHING') })

    // ── STAGE 3: OUTLINING ───────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'OUTLINING', progress: progressAt('RESEARCHING') + 2 })

    const outlineText = await callAgent(
      OUTLINE_SYSTEM,
      `Research:\n${researchText}\n\nPage budget: ${pageBudget}\nDocument type: ${documentType}`,
    )

    await updateJob(jobId, { progress: progressAt('OUTLINING') })

    // ── STAGE 4: WRITING ─────────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'WRITING', progress: progressAt('OUTLINING') + 2 })

    const rawAST = await callAgent(
      WRITER_SYSTEM,
      `Outline:\n${outlineText}\n\nResearch:\n${researchText}\n\nTheme: ${theme}\nPage budget: ${pageBudget}`,
    )

    await updateJob(jobId, { progress: progressAt('WRITING') })

    // Parse the document AST from the writer output
    const documentAST = parseDocumentAST(rawAST, job)

    // ── STAGE 5: ILLUSTRATING ────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'ILLUSTRATING', progress: progressAt('WRITING') + 2 })

    const illustratedAST = await runIllustrationAgent(documentAST)

    await updateJob(jobId, { progress: progressAt('ILLUSTRATING') })

    // ── STAGE 6: LAYOUT ──────────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'LAYOUT', progress: progressAt('ILLUSTRATING') + 2 })

    const laidOutAST = applyLayoutVariants(illustratedAST)

    await updateJob(jobId, { progress: progressAt('LAYOUT') })

    // ── STAGE 7: QA ──────────────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'QA', progress: progressAt('LAYOUT') + 2 })

    const qaScore = runQualityGate(laidOutAST)
    if (qaScore < 60) {
      throw new Error(`Quality gate failed: score ${qaScore}/100`)
    }

    await updateJob(jobId, { progress: progressAt('QA') })

    // ── STAGE 8: EXPORTING ───────────────────────────────────────────────────
    await updateJob(jobId, { currentStage: 'EXPORTING', progress: progressAt('QA') + 2 })

    // Mark as complete — PDF export happens on-demand from canvas
    await updateJob(jobId, {
      status: 'COMPLETE',
      currentStage: 'COMPLETE',
      progress: 100,
      documentAST: laidOutAST,
    })
  } catch (err) {
    await updateJob(jobId, {
      status: 'FAILED',
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE DOCUMENT AST FROM WRITER OUTPUT
// ─────────────────────────────────────────────────────────────────────────────

export function parseDocumentAST(rawText: string, job: JobRecord): DocumentAST {
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) ??
    rawText.match(/```\s*([\s\S]*?)```/) ??
    [null, rawText]

  const themeId = (job.theme ?? 'nordic_crisp') as ThemeId
  const themePreset = THEME_PRESETS[themeId]

  try {
    const parsed = JSON.parse(jsonMatch[1]!)
    if (parsed?.pages && Array.isArray(parsed.pages)) {
      return {
        id: job.documentId,
        schemaVersion: '1.0.0',
        metadata: {
          title: parsed.metadata?.title ?? 'Generated Document',
          subtitle: parsed.metadata?.subtitle,
          paperSize: 'LETTER',
          orientation: 'PORTRAIT',
          documentType: job.documentType as DocumentAST['metadata']['documentType'],
        },
        theme: {
          id: themeId,
          headingFont: themePreset.headingFont,
          bodyFont: themePreset.bodyFont,
          monoFont: themePreset.monoFont,
          accentColor: themePreset.accentColor,
          mode: themePreset.mode,
        },
        pages: parsed.pages.slice(0, job.pageBudget + 2),
        generatedAt: new Date().toISOString(),
        promptUsed: job.prompt,
      }
    }
  } catch {
    // Fall through
  }

  return synthesizeDocumentFromText(rawText, job, themeId, themePreset)
}

export function synthesizeDocumentFromText(
  text: string,
  job: JobRecord,
  themeId: ThemeId,
  themePreset: (typeof THEME_PRESETS)[ThemeId],
): DocumentAST {
  const lines = text.split('\n').filter(Boolean)
  const title = lines[0]?.replace(/^#+\s*/, '') ?? job.prompt.slice(0, 80)

  const sections = extractSections(text, job.pageBudget)

  const pages: PageNode[] = [
    buildCoverPage(title, job),
    buildTOCPage(sections),
    ...sections.map((s, i) => buildContentPage(s, i + 3)),
  ]

  return {
    id: job.documentId,
    schemaVersion: '1.0.0',
    metadata: {
      title,
      paperSize: 'LETTER',
      orientation: 'PORTRAIT',
      documentType: job.documentType as DocumentAST['metadata']['documentType'],
    },
    theme: {
      id: themeId,
      headingFont: themePreset.headingFont,
      bodyFont: themePreset.bodyFont,
      monoFont: themePreset.monoFont,
      accentColor: themePreset.accentColor,
      mode: themePreset.mode,
    },
    pages: pages.slice(0, job.pageBudget + 2),
    generatedAt: new Date().toISOString(),
    promptUsed: job.prompt,
  }
}

export interface Section {
  title: string
  body: string[]
  hasData: boolean
}

export function extractSections(text: string, pageBudget: number): Section[] {
  const MAX = Math.max(pageBudget - 2, 1)
  const lines = text.split('\n')
  const sections: Section[] = []
  let current: Section | null = null

  for (const line of lines) {
    const isHeading = /^#{1,3}\s+/.test(line)
    if (isHeading) {
      if (current) sections.push(current)
      current = {
        title: line.replace(/^#+\s*/, ''),
        body: [],
        hasData: false,
      }
    } else if (current && line.trim()) {
      current.body.push(line.trim())
      if (/\d+%|\d+x|\$\d+/.test(line)) current.hasData = true
    }
  }
  if (current) sections.push(current)

  return sections.slice(0, MAX)
}

export function buildCoverPage(title: string, job: JobRecord): PageNode {
  return {
    id: crypto.randomUUID(),
    pageNumber: 1,
    layoutVariant: 'cover',
    elements: [
      {
        id: crypto.randomUUID(),
        type: 'heading',
        content: { level: 1, text: title },
      },
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        content: {
          text: `A comprehensive ${job.documentType} prepared by PublishEngine.`,
          emphasis: 'lead',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'illustration',
        content: {
          description: `Hero illustration for: ${title}`,
          aspectRatio: '16:9',
        },
      },
    ],
  }
}

export function buildTOCPage(sections: Section[]): PageNode {
  return {
    id: crypto.randomUUID(),
    pageNumber: 2,
    layoutVariant: 'table_of_contents',
    elements: [
      {
        id: crypto.randomUUID(),
        type: 'heading',
        content: { level: 1, text: 'Table of Contents' },
      },
      ...sections.map((s, i) => ({
        id: crypto.randomUUID(),
        type: 'paragraph' as const,
        content: { text: `${i + 3}. ${s.title}`, emphasis: 'normal' as const },
      })),
    ],
  }
}

export function buildContentPage(section: Section, pageNumber: number): PageNode {
  const elements: PageNode['elements'] = [
    {
      id: crypto.randomUUID(),
      type: 'heading',
      content: { level: 2, text: section.title },
    },
    ...section.body.slice(0, 6).map((text) => ({
      id: crypto.randomUUID(),
      type: 'paragraph' as const,
      content: { text, emphasis: 'normal' as const },
    })),
  ]

  if (section.hasData) {
    elements.push({
      id: crypto.randomUUID(),
      type: 'illustration',
      content: {
        description: `Data visualization for ${section.title}`,
        aspectRatio: '16:9',
      },
    })
  }

  return {
    id: crypto.randomUUID(),
    pageNumber,
    layoutVariant: 'standard_editorial',
    elements,
  }
}

async function runIllustrationAgent(doc: DocumentAST): Promise<DocumentAST> {
  const pages = await Promise.all(
    doc.pages.map(async (page) => {
      const illustrationEls = page.elements.filter((el) => el.type === 'illustration')
      if (illustrationEls.length === 0) return page

      const updatedElements = await Promise.all(
        page.elements.map(async (el) => {
          if (el.type !== 'illustration') return el
          const svg = await generateIllustrationSVG(el.content.description ?? '')
          return { ...el, content: { ...el.content, svg } }
        }),
      )

      return { ...page, elements: updatedElements }
    }),
  )

  return { ...doc, pages }
}

async function generateIllustrationSVG(description: string): Promise<string> {
  try {
    const svgCode = await callAgent(
      ILLUSTRATION_SYSTEM,
      `Create a minimal, abstract SVG illustration for: ${description}`,
    )
    const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/i)
    return svgMatch ? svgMatch[0] : generateFallbackSVG()
  } catch {
    return generateFallbackSVG()
  }
}

function generateFallbackSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" fill="none">
    <rect width="400" height="225" rx="8" fill="#f0f4f8"/>
    <circle cx="200" cy="112" r="48" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="120" y1="112" x2="280" y2="112" stroke="#94a3b8" stroke-width="1"/>
    <line x1="200" y1="64" x2="200" y2="160" stroke="#94a3b8" stroke-width="1"/>
  </svg>`
}

export function applyLayoutVariants(doc: DocumentAST): DocumentAST {
  const pages = doc.pages.map((page, i) => {
    if (i === 0) return { ...page, layoutVariant: 'cover' as const }
    if (i === 1) return { ...page, layoutVariant: 'table_of_contents' as const }

    const hasIllustration = page.elements.some((el) => el.type === 'illustration')
    const hasTable = page.elements.some((el) => el.type === 'data_table')
    const hasTimeline = page.elements.some((el) => el.type === 'timeline')
    const hasMetrics = page.elements.some((el) => el.type === 'metrics_block')

    let layoutVariant: PageNode['layoutVariant'] = 'standard_editorial'
    if (hasTable) layoutVariant = 'data_table'
    else if (hasTimeline) layoutVariant = 'timeline'
    else if (hasMetrics) layoutVariant = 'infographic'
    else if (hasIllustration && i % 3 === 0) layoutVariant = 'two_column'

    return { ...page, layoutVariant }
  })

  return { ...doc, pages }
}

export function runQualityGate(doc: DocumentAST): number {
  let score = 100

  if (doc.pages.length < 2) score -= 30

  for (const page of doc.pages) {
    if (page.elements.length < 1) score -= 5
  }

  if (!doc.metadata.title || doc.metadata.title.length < 3) score -= 20

  const hasIllustrations = doc.pages.some((p) =>
    p.elements.some((el) => el.type === 'illustration'),
  )
  if (!hasIllustrations) score -= 10

  return Math.max(0, score)
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT SYSTEM PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

const PLANNER_SYSTEM = `You are the Planner Agent for a world-class AI PDF publishing platform.
Your job: analyze the user's prompt and create a strategic document plan.
Output a structured plan with: document title, target audience, key message, 
chapter list with page allocation, tone/style guidelines, and visual requirements.
Be concise and precise. Think like an editorial director at a top consulting firm.`

const RESEARCH_SYSTEM = `You are the Research Agent for an AI PDF publishing platform.
Given a document plan, produce research notes: key facts, statistics, frameworks, 
case studies, and quotes relevant to each chapter. Prioritize accuracy and depth.
Format your output as structured research notes by chapter.`

const OUTLINE_SYSTEM = `You are the Outline Agent. Given research notes and a plan,
produce a detailed page-by-page outline. For each page, specify:
- Page title
- Layout type (cover/standard_editorial/two_column/infographic/data_table/timeline)
- Key points (2-5 bullets)
- Whether an illustration or data visualization is needed
Keep it precise. Every page must have a clear purpose.`

const WRITER_SYSTEM = `You are the Writer Agent for a premium AI PDF publishing platform.
Given an outline and research, write the complete document content.

OUTPUT FORMAT: Return a JSON code block with this structure:
\`\`\`json
{
  "metadata": { "title": "...", "subtitle": "..." },
  "pages": [
    {
      "id": "uuid",
      "pageNumber": 1,
      "layoutVariant": "cover",
      "elements": [
        { "id": "uuid", "type": "heading", "content": { "level": 1, "text": "..." } },
        { "id": "uuid", "type": "paragraph", "content": { "text": "...", "emphasis": "lead" } }
      ]
    }
  ]
}
\`\`\`

Element types: heading (level 1-3), paragraph (emphasis: normal/lead/caption),
callout (variant: info/warning/success/insight), pull_quote, data_table, 
metrics_block, illustration (description only), timeline, divider, spacer.

Write at a professional, editorial level. No filler content.
Use real insights, not placeholders. Vary layout types across pages.`

const ILLUSTRATION_SYSTEM = `You are an SVG Illustration Agent.
Create minimal, professional abstract SVG illustrations.
Style: clean lines, geometric shapes, limited palette (use HSL colors at 15-20% opacity backgrounds).
Size: viewBox="0 0 400 225" for 16:9, or "0 0 300 300" for 1:1.
Output ONLY the SVG code, no explanation. Make it beautiful and editorial.`
