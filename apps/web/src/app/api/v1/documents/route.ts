/**
 * POST /api/v1/documents
 *
 * Creates a new document generation job.
 * Returns a jobId and documentId immediately; the pipeline runs asynchronously.
 * Progress is streamed via SSE at /api/v1/documents/[id]/progress.
 *
 * Source: .agent/API_SPEC.md — Initialize Document Request Payload
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST SCHEMA
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

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY JOB REGISTRY (dev-mode, no DB yet)
// In production: store in PostgreSQL + Redis via DATABASE_URL / REDIS_URL.
// ─────────────────────────────────────────────────────────────────────────────

import { jobRegistry, type JobRecord } from '@/lib/pipeline/registry'

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateDocumentBody.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:8080'
  try {
    console.log(`[web] Trying to proxy document creation to Orchestrator: ${orchestratorUrl}/api/v1/documents`)
    const response = await fetch(`${orchestratorUrl}/api/v1/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: 201 })
    }
  } catch (err) {
    console.warn('[web] Orchestrator service unavailable, falling back to local execution:', err)
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

  jobRegistry.set(jobId, job)

  // Kick off the AI pipeline asynchronously (fire-and-forget from the request)
  runPipelineAsync(jobId).catch((err) => {
    console.error('[pipeline] Fatal error for job', jobId, err)
    const j = jobRegistry.get(jobId)
    if (j) {
      j.status = 'FAILED'
      j.error = String(err)
    }
  })

  return NextResponse.json(
    {
      job_id: jobId,
      document_id: documentId,
      status: 'QUEUED',
      current_stage: 'PLANNING',
    },
    { status: 201 },
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE RUNNER (async, called after response is sent)
// ─────────────────────────────────────────────────────────────────────────────

async function runPipelineAsync(jobId: string): Promise<void> {
  const job = jobRegistry.get(jobId)
  if (!job) throw new Error(`Job ${jobId} not found in registry`)

  const { runPipeline } = await import('@/lib/pipeline/pipelineRunner')
  await runPipeline(job, jobRegistry)
}
