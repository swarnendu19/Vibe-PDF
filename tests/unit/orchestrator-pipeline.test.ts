import { describe, it, expect } from 'vitest'
import {
  progressAt,
  extractSections,
  buildCoverPage,
  buildTOCPage,
  applyLayoutVariants,
  runQualityGate,
  parseDocumentAST
} from '../../services/orchestrator/src/agents/pipelineRunner'
import { JobRecord } from '../../services/orchestrator/src/database/db'
import { DocumentAST } from '@repo/document-model'

describe('Orchestrator Pipeline Runner Helpers', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
  const mockJob: JobRecord = {
    jobId: mockUUID,
    documentId: mockUUID,
    status: 'QUEUED',
    currentStage: 'PLANNING',
    progress: 0,
    prompt: 'Create an editorial PDF',
    documentType: 'report',
    pageBudget: 4,
    theme: 'nordic_crisp',
    createdAt: new Date().toISOString(),
  }

  it('should calculate stage progress correctly', () => {
    // PLANNING weight is 8, prior is 0
    expect(progressAt('PLANNING', 1)).toBe(8)
    expect(progressAt('PLANNING', 0.5)).toBe(4)

    // RESEARCHING weight is 12, prior is 8
    expect(progressAt('RESEARCHING', 1)).toBe(20)

    // WRITING weight is 35, prior is 8+12+10 = 30
    expect(progressAt('WRITING', 1)).toBe(65)
  })

  it('should extract section headings and body text, identifying data tables', () => {
    const markdown = `## Section One\nThis is paragraph one.\nIt has some text.\n\n## Section Two\nThis has a 50% increase in metrics.\n`
    const sections = extractSections(markdown, 4)

    expect(sections).toHaveLength(2)
    expect(sections[0]?.title).toBe('Section One')
    expect(sections[0]?.body).toContain('This is paragraph one.')
    expect(sections[0]?.hasData).toBe(false)

    expect(sections[1]?.title).toBe('Section Two')
    expect(sections[1]?.hasData).toBe(true) // due to 50%
  })

  it('should build valid cover page node', () => {
    const page = buildCoverPage('Editorial Report', mockJob)
    expect(page.pageNumber).toBe(1)
    expect(page.layoutVariant).toBe('cover')
    expect(page.elements).toHaveLength(3)
    expect(page.elements[0]?.type).toBe('heading')
    expect(page.elements[1]?.type).toBe('paragraph')
    expect(page.elements[2]?.type).toBe('illustration')
  })

  it('should build valid TOC page node', () => {
    const sections = [
      { title: 'Introduction', body: [], hasData: false },
      { title: 'Deep Dive', body: [], hasData: false }
    ]
    const page = buildTOCPage(sections)
    expect(page.pageNumber).toBe(2)
    expect(page.layoutVariant).toBe('table_of_contents')
    expect(page.elements).toHaveLength(3) // 1 heading, 2 paragraph items
    expect(page.elements[0]?.type).toBe('heading')
  })

  it('should map appropriate layout variants based on child elements', () => {
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
      pages: [
        {
          id: '1',
          pageNumber: 1,
          layoutVariant: 'cover',
          elements: []
        },
        {
          id: '2',
          pageNumber: 2,
          layoutVariant: 'table_of_contents',
          elements: []
        },
        {
          id: '3',
          pageNumber: 3,
          layoutVariant: 'standard_editorial',
          elements: [
            { id: 'el-1', type: 'timeline', content: { milestones: [] } }
          ]
        },
        {
          id: '4',
          pageNumber: 4,
          layoutVariant: 'standard_editorial',
          elements: [
            { id: 'el-2', type: 'data_table', content: { headers: [], rows: [] } }
          ]
        }
      ]
    }

    const updatedDoc = applyLayoutVariants(doc)
    expect(updatedDoc.pages[0]?.layoutVariant).toBe('cover')
    expect(updatedDoc.pages[1]?.layoutVariant).toBe('table_of_contents')
    expect(updatedDoc.pages[2]?.layoutVariant).toBe('timeline')
    expect(updatedDoc.pages[3]?.layoutVariant).toBe('data_table')
  })

  it('should run quality gate rules and score documents', () => {
    const goodDoc: DocumentAST = {
      id: mockUUID,
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Excellent Strategy Report',
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
          elements: [
            { id: 'e1', type: 'heading', content: { level: 1, text: 'Title' } },
            { id: 'e2', type: 'illustration', content: { description: 'Illustration description' } }
          ]
        },
        {
          id: '2',
          pageNumber: 2,
          layoutVariant: 'standard_editorial',
          elements: [
            { id: 'e3', type: 'paragraph', content: { text: 'Paragraph content.' } }
          ]
        }
      ]
    }

    const score = runQualityGate(goodDoc)
    expect(score).toBe(100)

    const badDoc: DocumentAST = {
      id: mockUUID,
      schemaVersion: '1.0.0',
      metadata: {
        title: '', // -20 points
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
          elements: [] // -5 points (no elements)
        }
      ] // -30 points (less than 2 pages), no illustration (-10 points)
    }

    const badScore = runQualityGate(badDoc)
    expect(badScore).toBeLessThan(50)
  })

  it('should parse valid JSON DocumentAST from writer text', () => {
    const rawText = 'Here is the generated output:\n```json\n{\n  "metadata": { "title": "Corporate Outline" },\n  "pages": [\n    {\n      "id": "123e4567-e89b-12d3-a456-426614174000",\n      "pageNumber": 1,\n      "layoutVariant": "cover",\n      "elements": []\n    }\n  ]\n}\n```'
    const ast = parseDocumentAST(rawText, mockJob)

    expect(ast.metadata.title).toBe('Corporate Outline')
    expect(ast.pages).toHaveLength(1)
    expect(ast.pages[0]?.layoutVariant).toBe('cover')
  })

  it('should synthesize DocumentAST from unstructured text as a fallback', () => {
    const rawText = '# Title of Document\n\n## Section One\nFirst body paragraph.'
    const ast = parseDocumentAST(rawText, mockJob)

    expect(ast.metadata.title).toBe('Title of Document')
    expect(ast.pages).toHaveLength(4) // Cover, TOC, Title section, and Section One
    expect(ast.pages[0]?.layoutVariant).toBe('cover')
    expect(ast.pages[1]?.layoutVariant).toBe('table_of_contents')
    expect(ast.pages[2]?.layoutVariant).toBe('standard_editorial')
    expect(ast.pages[3]?.layoutVariant).toBe('standard_editorial')
  })
})
