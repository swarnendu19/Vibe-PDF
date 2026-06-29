/**
 * POST /api/v1/documents/[id]/pages/[pageId]/edit
 *
 * Handles individual page canvas actions:
 *   EDIT_TEXT, SWAP_THEME, REORDER_PAGES, DUPLICATE_PAGE, DELETE_PAGE, REGENERATE_PAGE
 *
 * Source: .agent/CANVAS_EDITOR.md, .agent/API_SPEC.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { jobRegistry } from '@/lib/pipeline/registry'

const EditCommand = z.object({
  action: z.enum([
    'EDIT_TEXT',
    'SWAP_THEME',
    'REORDER_PAGES',
    'DUPLICATE_PAGE',
    'DELETE_PAGE',
    'REGENERATE_PAGE',
  ]),
  payload: z.record(z.unknown()).optional(),
  userInstruction: z.string().max(1000).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> },
) {
  const { id: documentId, pageId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = EditCommand.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { action, payload: _payload, userInstruction } = parsed.data

  const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:8080'
  try {
    const response = await fetch(`${orchestratorUrl}/api/v1/documents/${documentId}/pages/${pageId}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }
  } catch (err) {
    console.warn('[web] Orchestrator service unavailable, falling back to local edit handling:', err)
  }

  const job = Array.from(jobRegistry.values()).find(
    (j) => j.documentId === documentId,
  )

  if (!job || !job.documentAST) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (action === 'REGENERATE_PAGE') {
    // Async page regeneration — updates the page in the AST
    regeneratePageAsync(job, pageId, userInstruction).catch(console.error)
    return NextResponse.json({ status: 'regenerating', pageId }, { status: 202 })
  }

  // Synchronous mutations are handled client-side via Zustand store
  // This endpoint primarily handles REGENERATE_PAGE which needs server-side AI
  return NextResponse.json({ status: 'ok', action, pageId }, { status: 200 })
}

async function regeneratePageAsync(
  job: import('@/lib/pipeline/registry').JobRecord,
  pageId: string,
  instruction?: string,
) {
  const { generateText } = await import('ai')
  const { google } = await import('@ai-sdk/google')

  const doc = job.documentAST as { pages: Array<{ id: string; pageNumber: number; elements: unknown[] }> }
  const page = doc.pages.find((p) => p.id === pageId)
  if (!page) return

  const model = google('gemini-2.0-flash-001')
  const { text } = await generateText({
    model,
    system: `You are a page regeneration agent. Rewrite a single PDF page based on user instruction.
Return only a JSON object for the page's elements array. Keep the same page structure.`,
    prompt: `Current page ${page.pageNumber} elements: ${JSON.stringify(page.elements)}
User instruction: ${instruction ?? 'Improve this page content quality and visual variety'}
Page budget for job: ${job.pageBudget} pages`,
    maxTokens: 3000,
  } as any)

  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? [null, text]
    const elements = JSON.parse(jsonMatch[1]!)
    if (Array.isArray(elements)) {
      page.elements = elements
    }
  } catch {
    // Keep original if parse fails
  }
}
