'use client'

import { cn } from '@/lib/utils'
import type { ThemeId } from '@repo/document-model'
import { THEME_PRESETS } from '@repo/document-model'

const themeLabels: Record<ThemeId, { label: string; description: string }> = {
  nordic_crisp: { label: 'Nordic Crisp', description: 'Clean, modern, professional' },
  warm_editorial: { label: 'Warm Editorial', description: 'Elegant, warm, magazine-style' },
  sleek_dark: { label: 'Sleek Dark', description: 'Dark, minimal, high-contrast' },
  corporate_navy: { label: 'Corporate Navy', description: 'Authoritative, formal, executive' },
  monochrome: { label: 'Monochrome', description: 'Timeless, pure, print-perfect' },
}

interface Props {
  value: ThemeId
  onChange: (theme: ThemeId) => void
}

export function ThemeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="mb-3 block font-heading text-sm font-semibold text-foreground">
        Editorial theme
      </label>
      <div className="flex flex-wrap gap-3">
        {(Object.keys(THEME_PRESETS) as ThemeId[]).map((themeId) => {
          const preset = THEME_PRESETS[themeId]
          const meta = themeLabels[themeId]
          const isActive = value === themeId

          return (
            <button
              key={themeId}
              onClick={() => onChange(themeId)}
              className={cn(
                'group flex items-center gap-3 rounded-lg border p-3 transition-all duration-150',
                isActive
                  ? 'border-accent bg-accent-subtle'
                  : 'border-border bg-surface hover:border-border-strong',
              )}
            >
              {/* Theme color swatch */}
              <div
                className="h-8 w-8 shrink-0 rounded-md shadow-soft"
                style={{
                  background: `hsl(${preset.accentColor})`,
                }}
                aria-hidden="true"
              />

              <div className="text-left">
                <p
                  className={cn(
                    'font-heading text-xs font-semibold',
                    isActive ? 'text-accent' : 'text-foreground',
                  )}
                >
                  {meta.label}
                </p>
                <p className="font-body text-xs text-muted">{meta.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
