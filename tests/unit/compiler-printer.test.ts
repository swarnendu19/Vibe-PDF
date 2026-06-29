import { describe, it, expect, vi } from 'vitest'
import { existsSync } from 'fs'

// Mock fs to control whether Chrome is "found" or not
vi.mock('fs', () => {
  return {
    existsSync: vi.fn().mockReturnValue(true), // Default to finding chrome
  }
})

import {
  esc,
  renderElement,
  renderPage,
  buildDocumentHTML,
  renderDocumentToPDF
} from '../../services/compiler/src/printer'
import { DocumentAST, PageNode } from '@repo/document-model'

describe('Compiler Printer', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000'

  it('should escape HTML special characters correctly', () => {
    expect(esc('Hello <World> & "Friends"')).toBe('Hello &lt;World&gt; &amp; &quot;Friends&quot;')
  })

  it('should render headings correctly', () => {
    const el = {
      id: 'e1',
      type: 'heading' as const,
      content: { level: 2 as const, text: 'Heading 2' }
    }
    const html = renderElement(el)
    expect(html).toBe('<h2>Heading 2</h2>')
  })

  it('should render paragraphs with different emphasis classes', () => {
    const normal = {
      id: 'e1',
      type: 'paragraph' as const,
      content: { text: 'Paragraph Text' }
    }
    expect(renderElement(normal)).toBe('<p>Paragraph Text</p>')

    const lead = {
      id: 'e2',
      type: 'paragraph' as const,
      content: { text: 'Lead Text', emphasis: 'lead' as const }
    }
    expect(renderElement(lead)).toBe('<p class="lead">Lead Text</p>')
  })

  it('should render callouts with correct styling classes', () => {
    const el = {
      id: 'e1',
      type: 'callout' as const,
      content: {
        variant: 'insight' as const,
        title: 'Callout Title',
        text: 'Callout Body Text'
      }
    }
    const html = renderElement(el)
    expect(html).toContain('callout-insight')
    expect(html).toContain('Callout Title')
    expect(html).toContain('Callout Body Text')
  })

  it('should render pull quotes with attribution', () => {
    const el = {
      id: 'e1',
      type: 'pull_quote' as const,
      content: {
        text: 'Famous Saying',
        attribution: 'Some Author'
      }
    }
    const html = renderElement(el)
    expect(html).toContain('"Famous Saying"')
    expect(html).toContain('— Some Author')
  })

  it('should render data tables with headers and rows', () => {
    const el = {
      id: 'e1',
      type: 'data_table' as const,
      content: {
        caption: 'Mock Table',
        headers: ['Name', 'Role'],
        rows: [['Alice', 'Engineer'], ['Bob', 'Designer']]
      }
    }
    const html = renderElement(el)
    expect(html).toContain('<table>')
    expect(html).toContain('<caption class="caption">Mock Table</caption>')
    expect(html).toContain('<th>Name</th>')
    expect(html).toContain('<td>Alice</td>')
    expect(html).toContain('<td>Designer</td>')
  })

  it('should render metrics blocks with grids', () => {
    const el = {
      id: 'e1',
      type: 'metrics_block' as const,
      content: {
        metrics: [
          { label: 'Revenue', value: '1.2', unit: 'M', trend: 'up' as const }
        ]
      }
    }
    const html = renderElement(el)
    expect(html).toContain('class="metrics-grid"')
    expect(html).toContain('1.2')
    expect(html).toContain('M')
    expect(html).toContain('Revenue')
  })

  it('should render illustration SVGs', () => {
    const el = {
      id: 'e1',
      type: 'illustration' as const,
      content: {
        description: 'Test SVG',
        svg: '<svg>mock-svg</svg>',
        aspectRatio: '16:9' as const
      }
    }
    const html = renderElement(el)
    expect(html).toContain('<svg>mock-svg</svg>')
  })

  it('should render timeline items', () => {
    const el = {
      id: 'e1',
      type: 'timeline' as const,
      content: {
        title: 'Timeline Title',
        milestones: [
          { date: '2026', title: 'Milestone 1', description: 'Description 1' }
        ]
      }
    }
    const html = renderElement(el)
    expect(html).toContain('Timeline Title')
    expect(html).toContain('2026')
    expect(html).toContain('Milestone 1')
    expect(html).toContain('Description 1')
  })

  it('should render divider styles', () => {
    const thin = { id: 'e1', type: 'divider' as const, content: { style: 'thin' as const } }
    expect(renderElement(thin)).toBe('<hr class="divider" />')

    const thick = { id: 'e2', type: 'divider' as const, content: { style: 'thick' as const } }
    expect(renderElement(thick)).toBe('<hr class="divider thick" />')
  })

  it('should render spacer heights', () => {
    const el = { id: 'e1', type: 'spacer' as const, content: { size: 'md' as const } }
    expect(renderElement(el)).toBe('<div class="spacer-md"></div>')
  })

  it('should build full document HTML correctly', () => {
    const doc: DocumentAST = {
      id: mockUUID,
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Document Title',
        paperSize: 'LETTER',
        orientation: 'PORTRAIT',
        documentType: 'report',
      },
      theme: {
        id: 'nordic_crisp',
        headingFont: 'Outfit',
        bodyFont: 'Lora',
        monoFont: 'IBM Plex Mono',
        accentColor: '215 90% 52%',
        mode: 'light',
      },
      pages: [
        {
          id: '1',
          pageNumber: 1,
          layoutVariant: 'cover',
          elements: []
        }
      ]
    }

    const html = buildDocumentHTML(doc)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<title>Document Title</title>')
    expect(html).toContain('--accent: hsl(215 90% 52%);')
  })

  it('should render cover page layout in renderPage', () => {
    const doc: DocumentAST = {
      id: mockUUID,
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Cover Page Doc',
        paperSize: 'LETTER',
        orientation: 'PORTRAIT',
        documentType: 'report',
      },
      theme: {
        id: 'nordic_crisp',
        headingFont: 'Outfit',
        bodyFont: 'Lora',
        monoFont: 'IBM Plex Mono',
        accentColor: '215 90% 52%',
        mode: 'light',
      },
      pages: []
    }

    const page: PageNode = {
      id: '1',
      pageNumber: 1,
      layoutVariant: 'cover',
      elements: []
    }

    const html = renderPage(page, doc)
    expect(html).toContain('class="page layout-cover"')
    expect(html).toContain('Cover Page Doc')
  })

  it('should run successful PDF compile when Chromium is present', async () => {
    const doc: DocumentAST = {
      id: mockUUID,
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Title',
        paperSize: 'LETTER',
        orientation: 'PORTRAIT',
        documentType: 'report',
      },
      theme: {
        id: 'nordic_crisp',
        headingFont: 'Outfit',
        bodyFont: 'Lora',
        monoFont: 'IBM Plex Mono',
        accentColor: '215 90% 52%',
        mode: 'light',
      },
      pages: []
    }

    // Force existsSync to return true
    vi.mocked(existsSync).mockReturnValue(true)

    const buffer = await renderDocumentToPDF(doc)
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.toString()).toBe('%PDF-1.4 mock pdf from puppeteer')
  })

  it('should throw an error during compile if Chromium is missing', async () => {
    const doc: DocumentAST = {
      id: mockUUID,
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Title',
        paperSize: 'LETTER',
        orientation: 'PORTRAIT',
        documentType: 'report',
      },
      theme: {
        id: 'nordic_crisp',
        headingFont: 'Outfit',
        bodyFont: 'Lora',
        monoFont: 'IBM Plex Mono',
        accentColor: '215 90% 52%',
        mode: 'light',
      },
      pages: []
    }

    // Force existsSync to return false (Chrome not found)
    vi.mocked(existsSync).mockReturnValue(false)

    await expect(renderDocumentToPDF(doc)).rejects.toThrowError(
      'Chrome/Chromium not found. Please install Google Chrome to enable PDF export.'
    )
  })
})
