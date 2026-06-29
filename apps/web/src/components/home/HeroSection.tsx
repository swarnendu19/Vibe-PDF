'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Sparkles, FileText, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXAMPLE_PROMPTS = [
  'Create a 6-page competitive analysis report for a SaaS startup entering the CRM market',
  'Write a technical architecture playbook for migrating from a monolith to microservices',
  'Generate an investor pitch deck for a climate-tech startup raising Series A',
  'Produce a quarterly marketing performance report with KPIs and recommendations',
  'Build a product requirements document for a mobile payments feature',
]

export function HeroSection() {
  const [prompt, setPrompt] = useState('')
  const [activePrompt, setActivePrompt] = useState<number | null>(null)

  const handleExampleClick = (example: string, index: number) => {
    setPrompt(example)
    setActivePrompt(index)
  }

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 lg:px-8">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--text-primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--text-primary)) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />

      {/* Accent glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
        style={{
          width: '800px',
          height: '600px',
          background:
            'radial-gradient(ellipse at center, hsl(var(--accent-primary)) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="font-heading text-xs font-medium text-foreground">
            AI-native publishing for enterprise teams
          </span>
          <ChevronRight className="h-3 w-3 text-muted" />
        </div>

        {/* Headline */}
        <h1 className="font-heading text-5xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Documents that look like
          <br />
          <span className="relative">
            <span
              className="relative z-10"
              style={{ color: 'hsl(var(--accent-primary))' }}
            >
              a designer made them
            </span>
            <span
              className="absolute bottom-1 left-0 z-0 h-2 w-full rounded-sm opacity-20"
              style={{ background: 'hsl(var(--accent-primary))' }}
              aria-hidden="true"
            />
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-muted md:text-xl">
          Type a prompt. Get a professionally designed, print-ready PDF in under 90 seconds. 
          Editorial typography, intelligent layouts, and AI-generated illustrations — all in one.
        </p>

        {/* Prompt input */}
        <div className="mx-auto mt-10 w-full max-w-3xl">
          <div className="relative rounded-xl border border-border bg-surface shadow-medium transition-shadow focus-within:shadow-strong focus-within:border-border-strong">
            <div className="flex items-start gap-3 p-4">
              <FileText
                className="mt-0.5 h-5 w-5 shrink-0 text-muted"
                strokeWidth={1.5}
              />
              <textarea
                id="hero-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the document you want to create..."
                className="w-full resize-none bg-transparent font-body text-sm leading-relaxed text-foreground placeholder:text-muted focus:outline-none"
                rows={3}
                maxLength={5000}
                aria-label="Document prompt"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="font-mono text-xs text-muted">
                {prompt.length > 0 ? `${prompt.length}/5000` : 'Be as specific as you like'}
              </span>
              <Link
                href={`/generate${prompt ? `?prompt=${encodeURIComponent(prompt)}` : ''}`}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-5 py-2 font-heading text-sm font-medium text-white transition-all duration-200 active:scale-95',
                  prompt.trim().length > 10
                    ? 'bg-accent shadow-soft hover:bg-accent-hover hover:shadow-medium'
                    : 'cursor-not-allowed bg-border text-muted',
                )}
                aria-disabled={prompt.trim().length <= 10}
              >
                Generate PDF
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Example prompts */}
          <div className="mt-5 text-left">
            <p className="mb-3 font-heading text-xs font-medium uppercase tracking-widest text-muted">
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example, i)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 font-body text-xs transition-all duration-150 text-left',
                    activePrompt === i
                      ? 'border-accent bg-accent-subtle text-accent'
                      : 'border-border bg-transparent text-muted hover:border-border-strong hover:text-foreground',
                  )}
                >
                  {example.length > 60 ? example.slice(0, 60) + '…' : example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { value: '50+', label: 'Document types' },
            { value: '< 90s', label: 'Generation time' },
            { value: '5 themes', label: 'Editorial styles' },
            { value: '100%', label: 'Print-ready output' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="font-body text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Document preview floating cards */}
      <DocumentPreviewCards />
    </section>
  )
}

function DocumentPreviewCards() {
  return (
    <div className="relative z-10 mx-auto mt-20 w-full max-w-5xl" aria-hidden="true">
      {/* Main preview card */}
      <div className="page-shadow relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-white">
        {/* Document simulation */}
        <div className="h-full p-8">
          {/* Cover page simulation */}
          <div className="mb-6 h-1 w-12 rounded-full bg-accent" />
          <div className="shimmer mb-3 h-8 w-3/4 rounded" />
          <div className="shimmer mb-6 h-4 w-1/2 rounded" />
          <div className="mb-4 space-y-2">
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-5/6 rounded" />
          </div>
          {/* Illustration placeholder */}
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-md bg-background-secondary">
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 opacity-30">
                <div className="h-12 w-12 rounded-full border-2 border-muted" />
                <div className="h-1 w-16 rounded bg-muted" />
                <div className="h-1 w-12 rounded bg-muted" />
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-4/5 rounded" />
          </div>
        </div>
      </div>

      {/* Floating badge: quality score */}
      <div className="absolute -right-2 top-8 rounded-lg border border-border bg-surface px-4 py-3 shadow-medium md:right-8">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-alert-success/10">
            <span className="text-xs font-bold" style={{ color: 'hsl(var(--alert-success))' }}>
              ✓
            </span>
          </div>
          <div>
            <p className="font-heading text-xs font-semibold text-foreground">Quality check passed</p>
            <p className="font-body text-xs text-muted">Score: 96/100</p>
          </div>
        </div>
      </div>

      {/* Floating badge: generation stage */}
      <div className="absolute -left-2 bottom-16 rounded-lg border border-border bg-surface px-4 py-3 shadow-medium md:left-8">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          <div>
            <p className="font-heading text-xs font-semibold text-foreground">Layout Agent</p>
            <p className="font-body text-xs text-muted">Mapping page 3 of 6…</p>
          </div>
        </div>
      </div>
    </div>
  )
}
