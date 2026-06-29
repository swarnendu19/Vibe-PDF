'use client'

import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'
import type { DocumentType } from '@repo/document-model'

const types: { id: DocumentType; label: string; description: string }[] = [
  { id: 'playbook', label: 'Playbook', description: 'Process guides & internal docs' },
  { id: 'report', label: 'Report', description: 'Data-driven analysis & metrics' },
  { id: 'case_study', label: 'Case Study', description: 'Customer success & outcomes' },
  { id: 'technical_docs', label: 'Technical Docs', description: 'Architecture & engineering' },
  { id: 'proposal', label: 'Proposal', description: 'Project scope & service offerings' },
  { id: 'whitepaper', label: 'Whitepaper', description: 'Research & thought leadership' },
]

interface Props {
  value: DocumentType
  onChange: (type: DocumentType) => void
}

export function DocumentTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="mb-3 block font-heading text-sm font-semibold text-foreground">
        Document type
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-150',
              value === type.id
                ? 'border-accent bg-accent-subtle'
                : 'border-border bg-surface hover:border-border-strong',
            )}
          >
            <FileText
              className={cn('mt-0.5 h-4 w-4 shrink-0', value === type.id ? 'text-accent' : 'text-muted')}
              strokeWidth={1.5}
            />
            <div>
              <p
                className={cn(
                  'font-heading text-sm font-medium',
                  value === type.id ? 'text-accent' : 'text-foreground',
                )}
              >
                {type.label}
              </p>
              <p className="mt-0.5 font-body text-xs text-muted">{type.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
