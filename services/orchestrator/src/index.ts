import express from 'express'
import { z } from 'zod'
import { initDb, saveJob, getJob, getJobByDocumentId, JobRecord } from './database/db'
import { runPipeline } from './agents/pipelineRunner'

const app = express()
const port = process.env.ORCHESTRATOR_PORT || 8080

app.use(express.json())

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const CreateDocumentBody = z.object({
  prompt: z.string().min(10).max(5000),
  document_type: z.enum([
    'playbook',
    'report',
    'case_study',
    'technical_docs',
    'proposal',
    'whitepaper',
  ]),
  page_budget: z.number().int().min(2).max(50),
  theme: z.enum([
    'nordic_crisp',
    'warm_editorial',
    'sleek_dark',
    'corporate_navy',
    'monochrome',
  ]),
})

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

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Create document job
app.post('/api/v1/documents', async (req, res) => {
  const parsed = CreateDocumentBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors })
    return
  }

  const { prompt, document_type, page_budget, theme } = parsed.data

  const jobId = crypto.randomUUID()
  const documentId = crypto.randomUUID()
  const now = new Date().toISOString()

  const job: JobRecord = {
    jobId,
    documentId,
    status: 'QUEUED',
    currentStage: 'PLANNING',
    progress: 0,
    prompt,
    documentType: document_type,
    pageBudget: page_budget,
    theme,
    createdAt: now,
  }

  await saveJob(job)

  // Asynchronously execute pipeline
  runPipeline(job).catch(async (err) => {
    console.error('[pipeline] Fatal error for job', jobId, err)
    const j = await getJob(jobId)
    if (j) {
      j.status = 'FAILED'
      j.error = String(err)
      await saveJob(j)
    }
  })

  res.status(201).json({
    job_id: jobId,
    document_id: documentId,
    status: 'QUEUED',
    current_stage: 'PLANNING',
  })
})

// Get document job by job ID or document ID
app.get('/api/v1/documents/:id', async (req, res) => {
  const { id } = req.params

  // Try fetching by document ID first, then job ID
  let job = await getJobByDocumentId(id!)
  if (!job) {
    job = await getJob(id!)
  }

  if (!job) {
    res.status(404).json({ error: 'Document or job not found' })
    return
  }

  if (job.status !== 'COMPLETE') {
    res.status(202).json({
      status: job.status,
      stage: job.currentStage,
      progress: job.progress,
      error: job.error,
    })
    return
  }

  res.json({
    jobId: job.jobId,
    documentId: job.documentId,
    status: job.status,
    document: job.documentAST,
  })
})

// SSE Progress updates stream
app.get('/api/v1/documents/:id/progress', async (req, res) => {
  const { id: jobId } = req.params

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  let lastProgress = -1
  let elapsed = 0
  const timeout = 180_000
  const intervalTime = 500

  const interval = setInterval(async () => {
    elapsed += intervalTime

    const job = await getJob(jobId!)

    if (!job) {
      res.write(`data: ${JSON.stringify({ error: 'Job not found', jobId })}\n\n`)
      clearInterval(interval)
      res.end()
      return
    }

    if (job.progress !== lastProgress) {
      lastProgress = job.progress
      res.write(
        `data: ${JSON.stringify({
          jobId: job.jobId,
          documentId: job.documentId,
          stage: job.currentStage,
          progress: job.progress,
          status: job.status,
          message: stageMessage(job.currentStage, job.progress),
          timestamp: new Date().toISOString(),
        })}\n\n`
      )
    }

    if (job.status === 'COMPLETE') {
      res.write(
        `data: ${JSON.stringify({
          jobId: job.jobId,
          documentId: job.documentId,
          stage: 'COMPLETE',
          progress: 100,
          status: 'COMPLETE',
          message: 'Document ready',
          timestamp: new Date().toISOString(),
          documentAST: job.documentAST,
        })}\n\n`
      )
      clearInterval(interval)
      res.end()
      return
    }

    if (job.status === 'FAILED') {
      res.write(
        `data: ${JSON.stringify({
          jobId: job.jobId,
          documentId: job.documentId,
          stage: 'FAILED',
          progress: job.progress,
          status: 'FAILED',
          message: job.error || 'Generation failed',
          timestamp: new Date().toISOString(),
        })}\n\n`
      )
      clearInterval(interval)
      res.end()
      return
    }

    if (elapsed >= timeout) {
      res.write(`data: ${JSON.stringify({ error: 'SSE timeout', jobId })}\n\n`)
      clearInterval(interval)
      res.end()
    }
  }, intervalTime)

  req.on('close', () => {
    clearInterval(interval)
  })
})

// Edit page canvas operations
app.post('/api/v1/documents/:id/pages/:pageId/edit', async (req, res) => {
  const { id: documentId, pageId } = req.params
  const parsed = EditCommand.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten() })
    return
  }

  const { action, userInstruction } = parsed.data

  const job = await getJobByDocumentId(documentId!)
  if (!job || !job.documentAST) {
    res.status(404).json({ error: 'Document not found' })
    return
  }

  if (action === 'REGENERATE_PAGE') {
    regeneratePageAsync(job, pageId!, userInstruction).catch(console.error)
    res.status(202).json({ status: 'regenerating', pageId })
    return
  }

  res.json({ status: 'ok', action, pageId })
})

// Update/Save document AST
app.put('/api/v1/documents/:id', async (req, res) => {
  const { id } = req.params
  const { documentAST } = req.body

  if (!documentAST) {
    res.status(400).json({ error: 'Missing documentAST' })
    return
  }

  let job = await getJobByDocumentId(id!)
  if (!job) {
    job = await getJob(id!)
  }

  if (!job) {
    res.status(404).json({ error: 'Document or job not found' })
    return
  }

  job.documentAST = documentAST
  await saveJob(job)

  res.json({ status: 'ok', documentId: job.documentId })
})

// Helper messages for SSE stages
function stageMessage(stage: string, progress: number): string {
  const messages: Record<string, string> = {
    PLANNING: 'Planning document architecture…',
    RESEARCHING: 'Researching content and sources…',
    OUTLINING: 'Building detailed outline…',
    WRITING: 'Writing editorial content…',
    ILLUSTRATING: 'Generating SVG illustrations…',
    TYPOGRAPHY: 'Binding typography system…',
    LAYOUT: 'Mapping page layouts…',
    QA: `Running quality gate (${progress}%)…`,
    EXPORTING: 'Compiling final PDF…',
    COMPLETE: 'Document ready for review.',
    FAILED: 'Generation failed.',
  }
  return messages[stage] ?? `Processing (${progress}%)…`
}

// Async page regeneration agent
async function regeneratePageAsync(
  job: JobRecord,
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
      await saveJob(job)
    }
  } catch {
    // Keep original if parse fails
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP
// ─────────────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    app.listen(port, () => {
      console.log(`[orchestrator] Orchestrator service listening on port ${port}`)
    })
  })
}

export { app }

