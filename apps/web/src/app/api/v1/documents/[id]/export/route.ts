/**
 * POST /api/v1/documents/[id]/export
 *
 * Renders the DocumentAST to a PDF buffer using Puppeteer.
 * Returns the PDF as a binary response with application/pdf content-type.
 *
 * Source: .agent/PDF_ENGINE.md, .agent/EXPORT_ENGINE.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { jobRegistry } from '@/lib/pipeline/registry'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params

  const job = Array.from(jobRegistry.values()).find(
    (j) => j.documentId === documentId,
  )

  if (!job || job.status !== 'COMPLETE' || !job.documentAST) {
    return NextResponse.json(
      { error: 'Document not ready for export' },
      { status: 404 },
    )
  }

  try {
    const compilerUrl = process.env.COMPILER_URL || 'http://localhost:8081'
    try {
      console.log(`[web] Trying to proxy PDF compilation to Compiler: ${compilerUrl}/compile`)
      const response = await fetch(`${compilerUrl}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentAST: job.documentAST }),
      })

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        const pdfBuffer = Buffer.from(arrayBuffer)
        return new Response(new Uint8Array(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="document-${documentId.slice(0, 8)}.pdf"`,
            'Content-Length': String(pdfBuffer.byteLength),
          },
        })
      }
    } catch (err) {
      console.warn('[web] Compiler service unavailable, falling back to local compilation:', err)
    }

    const { renderDocumentToPDF } = await import('@/lib/pdf/pdfRenderer')
    const pdfBuffer = await renderDocumentToPDF(job.documentAST as never)

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-${documentId.slice(0, 8)}.pdf"`,
        'Content-Length': String(pdfBuffer.byteLength),
      },
    })
  } catch (err) {
    console.error('[export] PDF render failed:', err)
    return NextResponse.json(
      { error: 'PDF export failed', detail: String(err) },
      { status: 500 },
    )
  }
}
