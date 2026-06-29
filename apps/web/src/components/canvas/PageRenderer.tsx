'use client'

/**
 * PageRenderer.tsx — DocumentAST PageNode → React UI
 *
 * Renders a single PageNode's elements as styled React components.
 * Used by the Canvas Editor to display a live preview of each page.
 * The visual output mirrors the PDF renderer's HTML output.
 *
 * Source: .agent/PAGE_LAYOUT_ENGINE.md, .agent/COMPONENT_LIBRARY.md
 */

import type { PageNode, ThemeId } from '@repo/document-model'
import { THEME_PRESETS } from '@repo/document-model'
import { cn } from '@/lib/utils'

interface Props {
  page: PageNode
  theme: ThemeId
  onElementUpdate?: ((elementId: string, patch: any) => void) | undefined
}

export function PageRenderer({ page, theme, onElementUpdate }: Props) {
  const preset = THEME_PRESETS[theme]
  const accent = `hsl(${preset.accentColor})`
  const accentSubtle = `hsl(${preset.accentColor} / 0.08)`

  const isCover = page.layoutVariant === 'cover'
  const isTOC = page.layoutVariant === 'table_of_contents'

  if (isCover) {
    return (
      <CoverPageRender
        page={page}
        accent={accent}
        accentSubtle={accentSubtle}
        preset={preset}
        onElementUpdate={onElementUpdate}
      />
    )
  }

  if (isTOC) {
    return <TOCPageRender page={page} accent={accent} onElementUpdate={onElementUpdate} />
  }

  return (
    <StandardPageRender
      page={page}
      accent={accent}
      accentSubtle={accentSubtle}
      onElementUpdate={onElementUpdate}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COVER PAGE
// ─────────────────────────────────────────────────────────────────────────────

function CoverPageRender({
  page,
  accent,
  accentSubtle,
  preset,
  onElementUpdate,
}: {
  page: PageNode
  accent: string
  accentSubtle: string
  preset: (typeof THEME_PRESETS)[ThemeId]
  onElementUpdate?: ((elementId: string, patch: any) => void) | undefined
}) {
  const headingEl = page.elements.find((e) => e.type === 'heading')
  const subtitleEl = page.elements.find(
    (e) => e.type === 'paragraph' && e.content.emphasis === 'lead',
  )
  const illustEl = page.elements.find((e) => e.type === 'illustration')

  const title = headingEl?.type === 'heading' ? headingEl.content.text : 'Document Title'
  const subtitle =
    subtitleEl?.type === 'paragraph'
      ? subtitleEl.content.text
      : 'A comprehensive analysis prepared for strategic review.'
  const year = new Date().getFullYear()

  return (
    <div className="flex h-full flex-col p-16">
      {/* Accent bar */}
      <div className="mb-10 h-0.5 w-14 rounded-full" style={{ background: accent }} />

      {/* Eyebrow */}
      <p className="mb-4 font-mono text-[8pt] uppercase tracking-widest text-gray-400">
        CONFIDENTIAL · {year}
      </p>

      {/* Title */}
      <h1
        contentEditable={!!onElementUpdate && !!headingEl}
        suppressContentEditableWarning={true}
        onBlur={(e) => {
          if (headingEl && headingEl.type === 'heading') {
            const text = e.currentTarget.textContent || ''
            if (text !== headingEl.content.text) {
              onElementUpdate?.(headingEl.id, { text })
            }
          }
        }}
        className="font-heading text-[32pt] font-semibold leading-tight tracking-tight text-gray-900 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1 transition-all"
        style={{ fontFamily: preset.headingFont }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        contentEditable={!!onElementUpdate && !!subtitleEl}
        suppressContentEditableWarning={true}
        onBlur={(e) => {
          if (subtitleEl && subtitleEl.type === 'paragraph') {
            const text = e.currentTarget.textContent || ''
            if (text !== subtitleEl.content.text) {
              onElementUpdate?.(subtitleEl.id, { text })
            }
          }
        }}
        className="mt-4 font-body text-[11pt] leading-relaxed text-gray-500 max-w-[75%] outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1 transition-all"
      >
        {subtitle}
      </p>

      {/* Illustration */}
      <div
        className="my-10 flex flex-1 items-center justify-center rounded-xl overflow-hidden"
        style={{ background: accentSubtle, minHeight: '200px', maxHeight: '260px' }}
      >
        {illustEl?.type === 'illustration' && illustEl.content.svg ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: illustEl.content.svg }}
          />
        ) : (
          <IllustrationPlaceholder accent={accent} />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between border-t border-gray-100 pt-4">
        <p className="font-heading text-[8pt] text-gray-400">PublishEngine</p>
        <p className="font-mono text-[8pt] text-gray-300">Page 1</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE OF CONTENTS
// ─────────────────────────────────────────────────────────────────────────────

function TOCPageRender({
  page,
  accent,
  onElementUpdate,
}: {
  page: PageNode
  accent: string
  onElementUpdate?: ((elementId: string, patch: any) => void) | undefined
}) {
  const paragraphEls = page.elements.filter((e) => e.type === 'paragraph')

  return (
    <div className="flex h-full flex-col p-16">
      <div className="mb-1 h-0.5 w-14 rounded-full" style={{ background: accent }} />
      <h1 className="mt-8 mb-10 font-heading text-[24pt] font-semibold text-gray-900">
        Table of Contents
      </h1>
      <div className="space-y-4">
        {paragraphEls.map((el, i) => {
          if (el.type !== 'paragraph') return null
          const text = el.content.text
          // Extract page number from "3. Section Title" format
          const match = text.match(/^(\d+)\.\s*(.+)/)
          const pageNum = match?.[1] ?? String(i + 3)
          const sectionTitle = match?.[2] ?? text

          return (
            <div key={el.id} className="flex items-baseline gap-2">
              <span
                contentEditable={!!onElementUpdate}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent || ''
                  if (val !== sectionTitle) {
                    onElementUpdate?.(el.id, { text: `${pageNum}. ${val}` })
                  }
                }}
                className="font-body text-[10pt] text-gray-700 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1"
              >
                {sectionTitle}
              </span>
              <span className="flex-1 border-b border-dotted border-gray-200" />
              <span
                contentEditable={!!onElementUpdate}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent || ''
                  if (val !== pageNum) {
                    onElementUpdate?.(el.id, { text: `${val}. ${sectionTitle}` })
                  }
                }}
                className="font-mono text-[9pt] text-gray-400 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1"
              >
                {pageNum}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD EDITORIAL PAGE
// ─────────────────────────────────────────────────────────────────────────────

function StandardPageRender({
  page,
  accent,
  accentSubtle,
  onElementUpdate,
}: {
  page: PageNode
  accent: string
  accentSubtle: string
  onElementUpdate?: ((elementId: string, patch: any) => void) | undefined
}) {
  return (
    <div className="flex h-full flex-col p-14">
      {/* Eyebrow */}
      <p className="mb-4 font-mono text-[7pt] uppercase tracking-widest text-gray-400">
        Section {page.pageNumber - 2}
      </p>

      <div className="flex-1 space-y-0">
        {page.elements.map((el) => (
          <ElementRender
            key={el.id}
            element={el}
            accent={accent}
            accentSubtle={accentSubtle}
            onElementUpdate={onElementUpdate}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4">
        <p className="font-heading text-[7pt] text-gray-300">PublishEngine</p>
        <p className="font-mono text-[7pt] text-gray-300">{page.pageNumber}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ELEMENT RENDERER
// ─────────────────────────────────────────────────────────────────────────────

function ElementRender({
  element,
  accent,
  accentSubtle,
  onElementUpdate,
}: {
  element: PageNode['elements'][number]
  accent: string
  accentSubtle: string
  onElementUpdate?: ((elementId: string, patch: any) => void) | undefined
}) {
  switch (element.type) {
    case 'heading': {
      const sizes = { 1: 'text-[22pt]', 2: 'text-[15pt]', 3: 'text-[11pt]' } as const
      const weights = { 1: 'font-semibold', 2: 'font-medium', 3: 'font-medium' } as const
      const margins = {
        1: 'mb-5 mt-0',
        2: 'mb-3 mt-6 first:mt-0',
        3: 'mb-2 mt-4 first:mt-0',
      } as const
      const lv = element.content.level
      return (
        <p
          contentEditable={!!onElementUpdate}
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const val = e.currentTarget.textContent || ''
            if (val !== element.content.text) {
              onElementUpdate?.(element.id, { text: val })
            }
          }}
          className={cn(
            'font-heading tracking-tight text-gray-900 leading-snug outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1 transition-all',
            sizes[lv],
            weights[lv],
            margins[lv],
          )}
        >
          {element.content.text}
        </p>
      )
    }

    case 'paragraph': {
      const emphasisCls = {
        lead: 'text-[10.5pt] text-gray-500 leading-relaxed',
        caption: 'text-[8pt] text-gray-400 italic',
        normal: 'text-[9.5pt] text-gray-600 leading-relaxed',
      } as const
      return (
        <p
          contentEditable={!!onElementUpdate}
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const val = e.currentTarget.textContent || ''
            if (val !== element.content.text) {
              onElementUpdate?.(element.id, { text: val })
            }
          }}
          className={cn(
            'mb-3 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1 transition-all',
            emphasisCls[element.content.emphasis ?? 'normal'],
          )}
        >
          {element.content.text}
        </p>
      )
    }

    case 'callout': {
      const variantStyles = {
        info: { border: '#3b82f6', bg: '#eff6ff' },
        success: { border: '#22c55e', bg: '#f0fdf4' },
        warning: { border: '#f59e0b', bg: '#fffbeb' },
        insight: { border: accent, bg: accentSubtle },
      }
      const style = variantStyles[element.content.variant]
      return (
        <div
          className="my-4 rounded-r-md px-4 py-3"
          style={{
            borderLeft: `3px solid ${style.border}`,
            background: style.bg,
          }}
        >
          {element.content.title !== undefined && (
            <p
              contentEditable={!!onElementUpdate}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const val = e.currentTarget.textContent || ''
                if (val !== element.content.title) {
                  onElementUpdate?.(element.id, { title: val })
                }
              }}
              className="font-heading text-[8pt] font-semibold uppercase tracking-wider text-gray-700 mb-1 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
            >
              {element.content.title}
            </p>
          )}
          <p
            contentEditable={!!onElementUpdate}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              const val = e.currentTarget.textContent || ''
              if (val !== element.content.text) {
                onElementUpdate?.(element.id, { text: val })
              }
            }}
            className="font-body text-[9pt] text-gray-600 leading-relaxed outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
          >
            {element.content.text}
          </p>
        </div>
      )
    }

    case 'pull_quote':
      return (
        <div
          className="my-5 pl-5"
          style={{ borderLeft: `3px solid ${accent}` }}
        >
          <p
            contentEditable={!!onElementUpdate}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              const val = e.currentTarget.textContent || ''
              // Clean surrounding quotes added by the user
              const cleaned = val.replace(/^["'\u201c\u201d]\s*|\s*["'\u201c\u201d]$/g, '')
              if (cleaned !== element.content.text) {
                onElementUpdate?.(element.id, { text: cleaned })
              }
            }}
            className="font-heading text-[12pt] font-normal italic text-gray-700 leading-snug outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1 transition-all"
          >
            "{element.content.text}"
          </p>
          {element.content.attribution !== undefined && (
            <p
              contentEditable={!!onElementUpdate}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const val = e.currentTarget.textContent || ''
                const cleaned = val.replace(/^—\s*/, '')
                if (cleaned !== element.content.attribution) {
                  onElementUpdate?.(element.id, { attribution: cleaned })
                }
              }}
              className="mt-2 font-mono text-[7.5pt] text-gray-400 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
            >
              — {element.content.attribution}
            </p>
          )}
        </div>
      )

    case 'data_table':
      return (
        <div className="my-4 overflow-hidden rounded-md border border-gray-100">
          {element.content.caption !== undefined && (
            <p
              contentEditable={!!onElementUpdate}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const val = e.currentTarget.textContent || ''
                if (val !== element.content.caption) {
                  onElementUpdate?.(element.id, { caption: val })
                }
              }}
              className="px-3 py-1.5 font-body text-[7.5pt] italic text-gray-400 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded transition-all"
            >
              {element.content.caption}
            </p>
          )}
          <table className="w-full text-left">
            <thead style={{ background: accentSubtle }}>
              <tr>
                {element.content.headers.map((h, ci) => (
                  <th
                    key={ci}
                    contentEditable={!!onElementUpdate}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || ''
                      if (val !== h) {
                        const newHeaders = [...element.content.headers]
                        newHeaders[ci] = val
                        onElementUpdate?.(element.id, { headers: newHeaders })
                      }
                    }}
                    className="px-3 py-2 font-heading text-[8pt] font-semibold text-gray-700 border-b border-gray-100 outline-none focus:bg-gray-100 focus:ring-1 focus:ring-accent"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {element.content.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? 'bg-gray-50' : ''}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      contentEditable={!!onElementUpdate}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent || ''
                        if (val !== cell) {
                          const newRows = [...element.content.rows]
                          newRows[ri] = [...newRows[ri]!]
                          newRows[ri]![ci] = val
                          onElementUpdate?.(element.id, { rows: newRows })
                        }
                      }}
                      className="px-3 py-2 font-body text-[8.5pt] text-gray-600 border-b border-gray-50 outline-none focus:bg-gray-100 focus:ring-1 focus:ring-accent"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'metrics_block':
      return (
        <div className="my-4 grid grid-cols-3 gap-3">
          {element.content.metrics.map((m, mi) => (
            <div
              key={m.label}
              className="rounded-lg p-3 border border-gray-100 bg-gray-50"
            >
              <p
                className="font-heading text-[18pt] font-semibold leading-none flex items-baseline"
                style={{ color: accent }}
              >
                <span
                  contentEditable={!!onElementUpdate}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent || ''
                    if (val !== m.value) {
                      const newMetrics = [...element.content.metrics]
                      newMetrics[mi] = { ...newMetrics[mi]!, value: val }
                      onElementUpdate?.(element.id, { metrics: newMetrics })
                    }
                  }}
                  className="outline-none focus:bg-gray-200 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
                >
                  {m.value}
                </span>
                {m.unit && (
                  <span
                    contentEditable={!!onElementUpdate}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || ''
                      if (val !== m.unit) {
                        const newMetrics = [...element.content.metrics]
                        newMetrics[mi] = { ...newMetrics[mi]!, unit: val }
                        onElementUpdate?.(element.id, { metrics: newMetrics })
                      }
                    }}
                    className="text-[9pt] opacity-60 ml-0.5 outline-none focus:bg-gray-200 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
                  >
                    {m.unit}
                  </span>
                )}
              </p>
              <p
                contentEditable={!!onElementUpdate}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent || ''
                  if (val !== m.label) {
                    const newMetrics = [...element.content.metrics]
                    newMetrics[mi] = { ...newMetrics[mi]!, label: val }
                    onElementUpdate?.(element.id, { metrics: newMetrics })
                  }
                }}
                className="mt-1.5 font-heading text-[7.5pt] text-gray-500 outline-none focus:bg-gray-200 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
              >
                {m.label}
              </p>
            </div>
          ))}
        </div>
      )

    case 'illustration':
      return (
        <div className="my-4">
          <div
            className="flex w-full items-center justify-center rounded-lg overflow-hidden"
            style={{
              background: accentSubtle,
              aspectRatio: element.content.aspectRatio === '1:1' ? '1/1' : '16/9',
            }}
          >
            {element.content.svg ? (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: element.content.svg }}
              />
            ) : (
              <IllustrationPlaceholder accent={accent} />
            )}
          </div>
          {element.content.caption && (
            <p className="mt-1.5 text-center font-mono text-[7pt] text-gray-400">
              {element.content.caption}
            </p>
          )}
        </div>
      )

    case 'timeline':
      return (
        <div className="my-4">
          {element.content.title && (
            <p
              contentEditable={!!onElementUpdate}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const val = e.currentTarget.textContent || ''
                if (val !== element.content.title) {
                  onElementUpdate?.(element.id, { title: val })
                }
              }}
              className="mb-3 font-heading text-[10pt] font-medium text-gray-800 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-1 transition-all"
            >
              {element.content.title}
            </p>
          )}
          <div className="space-y-3">
            {element.content.milestones.map((m, mi) => (
              <div key={mi} className="flex gap-3">
                <div
                  className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ background: accent }}
                />
                <div
                  contentEditable={!!onElementUpdate}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent || ''
                    if (val !== m.date) {
                      const newMilestones = [...element.content.milestones]
                      newMilestones[mi] = { ...newMilestones[mi]!, date: val }
                      onElementUpdate?.(element.id, { milestones: newMilestones })
                    }
                  }}
                  className="min-w-[52px] font-mono text-[7.5pt] text-gray-400 pt-0.5 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
                >
                  {m.date}
                </div>
                <div>
                  <p
                    contentEditable={!!onElementUpdate}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent || ''
                      if (val !== m.title) {
                        const newMilestones = [...element.content.milestones]
                        newMilestones[mi] = { ...newMilestones[mi]!, title: val }
                        onElementUpdate?.(element.id, { milestones: newMilestones })
                      }
                    }}
                    className="font-heading text-[9pt] font-medium text-gray-800 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
                  >
                    {m.title}
                  </p>
                  {m.description && (
                    <p
                      contentEditable={!!onElementUpdate}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent || ''
                        if (val !== m.description) {
                          const newMilestones = [...element.content.milestones]
                          newMilestones[mi] = { ...newMilestones[mi]!, description: val }
                          onElementUpdate?.(element.id, { milestones: newMilestones })
                        }
                      }}
                      className="mt-0.5 font-body text-[8.5pt] text-gray-500 outline-none focus:bg-gray-50 focus:ring-1 focus:ring-accent rounded px-0.5 transition-all"
                    >
                      {m.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'divider':
      return (
        <hr
          className="my-4"
          style={{
            border: 'none',
            borderTop: element.content.style === 'thick'
              ? `2px solid ${accent}`
              : '1px solid #e5e7eb',
          }}
        />
      )

    case 'spacer': {
      const heights = { xs: 'h-2', sm: 'h-4', md: 'h-6', lg: 'h-8', xl: 'h-12' }
      return <div className={heights[element.content.size]} />
    }

    default:
      return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ILLUSTRATION PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

function IllustrationPlaceholder({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col items-center gap-2 opacity-30" style={{ color: accent }}>
      <div className="h-10 w-10 rounded-full border-2 border-current" />
      <div className="h-1 w-16 rounded bg-current opacity-50" />
      <div className="h-1 w-10 rounded bg-current opacity-30" />
    </div>
  )
}
