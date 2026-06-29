/**
 * GET /api/v1/documents/[id]/progress
 *
 * Server-Sent Events (SSE) stream for real-time pipeline progress.
 * The client connects to this endpoint after POST /api/v1/documents.
 * Events are emitted as the pipeline advances through stages.
 *
 * Event format:
 *   data: { jobId, documentId, stage, progress, message, timestamp }
 *
 * Source: .agent/API_SPEC.md — SSE Progress Events
 * Source: .agent/AI_PIPELINE.md — Pipeline States
 */

import { NextRequest } from 'next/server'
import { jobRegistry } from '@/lib/pipeline/registry'

// Max SSE connection life: 180 seconds (per API_SPEC.md constraint §7)
const SSE_TIMEOUT_MS = 180_000
const POLL_INTERVAL_MS = 250

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: jobId } = await params

  const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:8080'
  try {
    const response = await fetch(`${orchestratorUrl}/api/v1/documents/${jobId}/progress`)
    if (response.ok && response.body) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
    }
  } catch (err) {
    console.warn('[web] Orchestrator progress service unavailable, falling back to local registry:', err)
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let elapsed = 0
      let lastProgress = -1
      let closed = false

      const close = () => {
        if (!closed) {
          closed = true
          controller.close()
        }
      }

      const send = (data: object) => {
        if (closed) return
        const payload = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(payload))
      }

      const tick = setInterval(() => {
        elapsed += POLL_INTERVAL_MS

        const job = jobRegistry.get(jobId)

        if (!job) {
          send({ error: 'Job not found', jobId })
          clearInterval(tick)
          close()
          return
        }

        // Only emit when progress changes to avoid flooding the client
        if (job.progress !== lastProgress) {
          lastProgress = job.progress
          send({
            jobId: job.jobId,
            documentId: job.documentId,
            stage: job.currentStage,
            progress: job.progress,
            status: job.status,
            message: stageMessage(job.currentStage, job.progress),
            timestamp: new Date().toISOString(),
          })
        }

        // Terminal states
        if (job.status === 'COMPLETE') {
          send({
            jobId: job.jobId,
            documentId: job.documentId,
            stage: 'COMPLETE',
            progress: 100,
            status: 'COMPLETE',
            message: 'Document ready',
            timestamp: new Date().toISOString(),
            documentAST: job.documentAST,
          })
          clearInterval(tick)
          close()
          return
        }

        if (job.status === 'FAILED') {
          send({
            jobId: job.jobId,
            documentId: job.documentId,
            stage: 'FAILED',
            progress: job.progress,
            status: 'FAILED',
            message: job.error ?? 'Generation failed',
            timestamp: new Date().toISOString(),
          })
          clearInterval(tick)
          close()
          return
        }

        // Enforce max connection duration
        if (elapsed >= SSE_TIMEOUT_MS) {
          send({ error: 'SSE timeout', jobId })
          clearInterval(tick)
          close()
        }
      }, POLL_INTERVAL_MS)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

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
