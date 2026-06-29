'use client'

/**
 * GeneratePageClient.tsx — Document generation configuration & pipeline trigger
 *
 * 1. User configures prompt, document type, theme, page budget
 * 2. POST /api/v1/documents to start the pipeline → receive jobId
 * 3. SSE progress stream via GenerationProgress
 * 4. On completion → navigate to /canvas/[documentId]
 */

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { DocumentTypeSelector } from '@/components/generate/DocumentTypeSelector'
import { ThemeSelector } from '@/components/generate/ThemeSelector'
import { PromptComposer } from '@/components/generate/PromptComposer'
import { GenerationProgress } from '@/components/generate/GenerationProgress'
import type { DocumentType, ThemeId, DocumentAST } from '@repo/document-model'
import { useDocumentStore } from '@/lib/store/documentStore'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type Step = 'configure' | 'generating' | 'complete'

function GenerateInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loadDocument } = useDocumentStore()

  const [step, setStep] = useState<Step>('configure')
  const [jobId, setJobId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const initialPrompt = searchParams.get('prompt') ?? ''
  const initialType = (searchParams.get('type') as DocumentType | null) ?? 'report'

  const [config, setConfig] = useState({
    prompt: initialPrompt,
    documentType: initialType,
    themeId: 'nordic_crisp' as ThemeId,
    pageBudget: 6,
  })

  const handleGenerate = async () => {
    setIsSubmitting(true)
    setApiError(null)

    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: config.prompt,
          document_type: config.documentType,
          page_budget: config.pageBudget,
          theme: config.themeId,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Network error' }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json() as { job_id: string; document_id: string }
      setJobId(data.job_id)
      setStep('generating')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to start generation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = (documentId: string, documentAST?: unknown) => {
    // Hydrate the Zustand store with the completed AST so the canvas editor
    // can render immediately without an extra fetch
    if (documentAST) {
      loadDocument(documentAST as DocumentAST)
    }
    router.push(`/canvas/${documentId}`)
  }

  const handleError = (message: string) => {
    setApiError(message)
    setStep('configure')
    setJobId(null)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
          {/* Back nav */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-body text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Error banner */}
          {apiError && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-heading text-sm font-semibold">Error</p>
                <p className="font-body text-sm">{apiError}</p>
                <p className="mt-1 font-body text-xs opacity-70">
                  Ensure GOOGLE_GENERATIVE_AI_API_KEY is set in your .env.local
                </p>
              </div>
            </div>
          )}

          {step === 'configure' && (
            <div className="animate-fade-in">
              <div className="mb-10">
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                  Configure your document
                </h1>
                <p className="mt-2 font-body text-sm text-muted">
                  The more detail you provide, the higher the quality of the generated PDF.
                </p>
              </div>

              <div className="space-y-8">
                <PromptComposer
                  value={config.prompt}
                  onChange={(prompt) => setConfig((c) => ({ ...c, prompt }))}
                />

                <DocumentTypeSelector
                  value={config.documentType}
                  onChange={(documentType) => setConfig((c) => ({ ...c, documentType }))}
                />

                <ThemeSelector
                  value={config.themeId}
                  onChange={(themeId) => setConfig((c) => ({ ...c, themeId }))}
                />

                {/* Page budget */}
                <div>
                  <label className="mb-3 block font-heading text-sm font-semibold text-foreground">
                    Page budget
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[2, 4, 6, 8, 10, 12, 16, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => setConfig((c) => ({ ...c, pageBudget: n }))}
                        className={`rounded-md border px-4 py-2 font-heading text-sm font-medium transition-all ${
                          config.pageBudget === n
                            ? 'border-accent bg-accent-subtle text-accent'
                            : 'border-border text-muted hover:border-border-strong hover:text-foreground'
                        }`}
                      >
                        {n} pages
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 font-body text-xs text-muted">
                    The AI may adjust this slightly based on content requirements.
                  </p>
                </div>

                {/* Generate button */}
                <div className="border-t border-border pt-6">
                  <button
                    onClick={handleGenerate}
                    disabled={config.prompt.trim().length < 10 || isSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-accent px-8 py-3 font-heading text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:bg-accent-hover hover:shadow-medium active:scale-95 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Starting pipeline…
                      </>
                    ) : (
                      <>
                        Generate PDF
                        <span className="text-xs opacity-70">~90 seconds</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'generating' && jobId && (
            <GenerationProgress
              jobId={jobId}
              config={config}
              onComplete={handleComplete}
              onError={handleError}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export function GeneratePageClient() {
  return (
    <Suspense>
      <GenerateInner />
    </Suspense>
  )
}
