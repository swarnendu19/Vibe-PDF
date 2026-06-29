'use client'

import { FileText } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function PromptComposer({ value, onChange }: Props) {
  return (
    <div>
      <label htmlFor="prompt-composer" className="mb-3 block font-heading text-sm font-semibold text-foreground">
        Describe your document
      </label>
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface transition-shadow focus-within:border-border-strong focus-within:shadow-medium">
        <div className="flex items-start gap-3 p-4">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted" strokeWidth={1.5} />
          <textarea
            id="prompt-composer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Be specific: include the audience, purpose, key sections you need, data sources, and the tone you want..."
            className="min-h-[120px] w-full resize-y bg-transparent font-body text-sm leading-relaxed text-foreground placeholder:text-muted focus:outline-none"
            maxLength={5000}
          />
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="font-mono text-xs text-muted">
            {value.length}/5000 characters
          </span>
          {value.trim().length < 10 && (
            <span className="font-body text-xs text-muted">
              Minimum 10 characters required
            </span>
          )}
        </div>
      </div>

      {/* Prompt tips */}
      <div className="mt-3 rounded-lg border border-border bg-background-secondary p-4">
        <p className="mb-2 font-heading text-xs font-semibold text-foreground">
          Tips for better results
        </p>
        <ul className="space-y-1.5">
          {[
            'Specify the target audience (e.g. "Series A investors", "engineering team")',
            'Mention the desired length or depth (e.g. "brief overview" vs "comprehensive guide")',
            'Include the tone (formal, conversational, technical, executive-level)',
            'List specific sections you need (e.g. "executive summary, market analysis, financials")',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 font-body text-xs text-muted">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
