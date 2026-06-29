'use client'

/**
 * GenerationProgress.tsx — Live SSE-connected pipeline progress viewer
 *
 * Connects to /api/v1/documents/[jobId]/progress via Server-Sent Events
 * and renders real-time stage updates from the AI pipeline.
 *
 * Source: .agent/AI_PIPELINE.md, .agent/API_SPEC.md
 */

import { useEffect, useState, useRef } from 'react'
import { Brain, FileText, Layers, Wand2, FileCheck, Download, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocumentType, ThemeId } from '@repo/document-model'

const PIPELINE_STAGES = [
  { id: 'PLANNING', label: 'Planning document architecture', icon: Brain },
  { id: 'RESEARCHING', label: 'Researching content & sources', icon: Brain },
  { id: 'OUTLINING', label: 'Building detailed outline', icon: FileText },
  { id: 'WRITING', label: 'Writing editorial content', icon: FileText },
  { id: 'ILLUSTRATING', label: 'Generating SVG illustrations', icon: Wand2 },
  { id: 'LAYOUT', label: 'Applying layout & typography', icon: Layers },
  { id: 'QA', label: 'Quality gate verification', icon: FileCheck },
  { id: 'EXPORTING', label: 'Compiling document', icon: Download },
]

interface Props {
  jobId: string
  config: {
    prompt: string
    documentType: DocumentType
    themeId: ThemeId
    pageBudget: number
  }
  onComplete: (documentId: string, documentAST?: unknown) => void
  onError?: (message: string) => void
}

interface SSEEvent {
  jobId?: string
  documentId?: string
  stage?: string
  progress?: number
  status?: string
  message?: string
  documentAST?: unknown
  error?: string
}

export function GenerationProgress({ jobId, config, onComplete, onError }: Props) {
  const [currentStage, setCurrentStage] = useState('PLANNING')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Initializing pipeline…')
  const [isComplete, setIsComplete] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Connect to SSE progress stream
    const es = new EventSource(`/api/v1/documents/${jobId}/progress`)
    esRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent

        if (data.error) {
          setIsFailed(true)
          setErrorMsg(data.error)
          onError?.(data.error)
          es.close()
          return
        }

        if (data.stage) setCurrentStage(data.stage)
        if (data.progress !== undefined) setProgress(data.progress)
        if (data.message) setMessage(data.message)

        if (data.status === 'COMPLETE') {
          setIsComplete(true)
          setProgress(100)
          es.close()
          setTimeout(() => {
            onComplete(data.documentId ?? jobId, data.documentAST)
          }, 1200)
        }

        if (data.status === 'FAILED') {
          setIsFailed(true)
          setErrorMsg(data.message ?? 'Generation failed')
          onError?.(data.message ?? 'Generation failed')
          es.close()
        }
      } catch {
        // ignore malformed events
      }
    }

    es.onerror = () => {
      if (!isComplete && !isFailed) {
        setIsFailed(true)
        setErrorMsg('Connection to pipeline lost.')
        onError?.('Connection to pipeline lost.')
      }
      es.close()
    }

    return () => {
      es.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          {isFailed ? 'Generation failed' : isComplete ? 'Document ready' : 'Generating your document'}
        </h1>
        <p className="mt-2 font-body text-sm text-muted">
          {isFailed
            ? errorMsg ?? 'An error occurred during pipeline execution.'
            : isComplete
            ? 'Quality checks passed. Opening the canvas editor…'
            : 'The AI pipeline is running. This typically takes 60–90 seconds.'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm font-medium text-foreground">Overall progress</span>
          <span className={cn('font-mono text-sm', isFailed ? 'text-red-500' : 'text-accent')}>
            {progress}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-secondary">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              isFailed ? 'bg-red-500' : isComplete ? 'bg-alert-success' : 'bg-accent',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        {message && !isFailed && (
          <p className="mt-2 font-mono text-xs text-muted">{message}</p>
        )}
      </div>

      {/* Stage list */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="space-y-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === stage.id)
            const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === currentStage)

            const isDone = (stageIdx < currentIdx) || isComplete
            const isCurrent = stageIdx === currentIdx && !isComplete && !isFailed
            const isPending = stageIdx > currentIdx && !isComplete
            const Icon = stage.icon

            return (
              <div
                key={stage.id}
                className={cn(
                  'flex items-center gap-4 transition-all duration-300',
                  isPending ? 'opacity-25' : 'opacity-100',
                )}
              >
                {/* Status dot */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                    isDone
                      ? 'bg-alert-success/10'
                      : isCurrent
                      ? 'bg-accent-subtle'
                      : 'bg-background-secondary',
                  )}
                >
                  {isDone ? (
                    <span className="text-sm font-bold" style={{ color: 'hsl(var(--alert-success))' }}>✓</span>
                  ) : (
                    <Icon
                      className={cn('h-4 w-4', isCurrent ? 'text-accent animate-pulse' : 'text-muted')}
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={cn(
                      'font-heading text-sm',
                      isDone ? 'text-muted line-through' : isCurrent ? 'font-semibold text-foreground' : 'text-muted',
                    )}
                  >
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <div className="mt-1.5 flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <div
                          key={dot}
                          className="h-1 w-1 rounded-full bg-accent animate-bounce"
                          style={{ animationDelay: `${dot * 150}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <span className="font-mono text-xs text-muted">{stage.id}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Agent activity indicator */}
      {!isComplete && !isFailed && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-background-secondary px-4 py-3">
          <Cpu className="h-4 w-4 text-accent animate-pulse" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="font-heading text-xs font-semibold text-foreground">
              {currentStage.charAt(0) + currentStage.slice(1).toLowerCase()} Agent
            </p>
            <p className="font-mono text-xs text-muted">{message}</p>
          </div>
          <span className="font-mono text-xs text-accent">{progress}%</span>
        </div>
      )}

      {/* Config summary */}
      <div className="mt-6 rounded-lg border border-border bg-background-secondary p-4">
        <p className="mb-2 font-heading text-xs font-semibold uppercase tracking-widest text-muted">
          Generation config
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Type', value: config.documentType },
            { label: 'Theme', value: config.themeId.replace(/_/g, ' ') },
            { label: 'Pages', value: String(config.pageBudget) },
            { label: 'Job', value: jobId.slice(0, 8) + '…' },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-heading text-xs text-muted">{item.label}</p>
              <p className="font-mono text-xs font-medium text-foreground capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
