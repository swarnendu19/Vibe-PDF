/**
 * GET  /api/v1/documents/[id]       — Fetch document AST by documentId
 * POST /api/v1/documents/[id]/pages/[pageId]/edit  — handled in a sub-route
 *
 * Source: .agent/API_SPEC.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { jobRegistry } from '@/lib/pipeline/registry'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params

  const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:8080'
  try {
    const response = await fetch(`${orchestratorUrl}/api/v1/documents/${documentId}`)
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ document: data.document }, { status: 200 })
    } else if (response.status === 202) {
      const data = await response.json()
      return NextResponse.json(
        { error: 'Document not ready', status: data.status, stage: data.stage },
        { status: 202 }
      )
    }
  } catch (err) {
    console.warn('[web] Orchestrator service unavailable, falling back to local registry for document:', err)
  }

  // Find job by documentId
  const job = Array.from(jobRegistry.values()).find(
    (j) => j.documentId === documentId,
  )

  if (!job) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (job.status !== 'COMPLETE') {
    return NextResponse.json(
      { error: 'Document not ready', status: job.status, stage: job.currentStage },
      { status: 202 },
    )
  }

  return NextResponse.json({ document: job.documentAST }, { status: 200 })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { documentAST } = body as { documentAST: any }
  if (!documentAST) {
    return NextResponse.json({ error: 'Missing documentAST' }, { status: 400 })
  }

  // Find job by documentId
  const job = Array.from(jobRegistry.values()).find(
    (j) => j.documentId === documentId,
  )

  if (!job) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  job.documentAST = documentAST

  const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:8080'
  try {
    console.log(`[web] Syncing document update to Orchestrator: ${orchestratorUrl}/api/v1/documents/${documentId}`)
    await fetch(`${orchestratorUrl}/api/v1/documents/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentAST }),
    })
  } catch (err) {
    console.warn('[web] Orchestrator service unavailable during sync:', err)
  }

  return NextResponse.json({ status: 'success' }, { status: 200 })
}
