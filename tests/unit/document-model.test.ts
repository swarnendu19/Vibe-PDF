import { describe, it, expect } from 'vitest'
import {
  DocumentAST,
  PageNode,
  ContentElement,
  createEmptyDocument,
  THEME_PRESETS,
  HeadingElement,
  ParagraphElement,
  CalloutElement
} from '../../packages/document-model/src/index'

describe('Document Model', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000'

  it('should validate a valid DocumentAST', () => {
    const validAST = {
      id: mockUUID,
      schemaVersion: '1.0.0' as const,
      metadata: {
        title: 'Q2 Performance Report',
        subtitle: 'Growth & Content Strategy',
        paperSize: 'LETTER' as const,
        orientation: 'PORTRAIT' as const,
        documentType: 'report' as const,
      },
      theme: {
        id: 'nordic_crisp' as const,
        headingFont: 'Outfit',
        bodyFont: 'Lora',
        monoFont: 'IBM Plex Mono',
        accentColor: '215 90% 52%',
        mode: 'light' as const,
      },
      pages: [
        {
          id: mockUUID,
          pageNumber: 1,
          layoutVariant: 'cover' as const,
          elements: [
            {
              id: mockUUID,
              type: 'heading' as const,
              content: {
                level: 1 as const,
                text: 'Corporate Strategy 2026',
              },
            },
            {
              id: mockUUID,
              type: 'paragraph' as const,
              content: {
                text: 'This is the detailed report outlining growth initiatives.',
                emphasis: 'lead' as const,
              },
            },
          ],
        },
      ],
      generatedAt: new Date().toISOString(),
      promptUsed: 'Generate a strategy report for Q2',
    }

    const result = DocumentAST.safeParse(validAST)
    expect(result.success).toBe(true)
  })

  it('should reject invalid DocumentAST missing mandatory fields', () => {
    const invalidAST = {
      schemaVersion: '1.0.0',
      metadata: {
        title: '', // Too short, min is 1
      },
    }

    const result = DocumentAST.safeParse(invalidAST)
    expect(result.success).toBe(false)
  })

  it('should generate empty document structure with overrides', () => {
    const base = createEmptyDocument({
      metadata: {
        title: 'Custom Title',
        paperSize: 'A4' as const,
        orientation: 'LANDSCAPE' as const,
        documentType: 'proposal' as const,
      },
      theme: {
        id: 'warm_editorial' as const,
        headingFont: 'Custom Heading',
        bodyFont: 'Custom Body',
        monoFont: 'Custom Mono',
        accentColor: '100 50% 50%',
        mode: 'light' as const,
      },
    })

    expect(base.schemaVersion).toBe('1.0.0')
    expect(base.metadata.title).toBe('Custom Title')
    expect(base.metadata.paperSize).toBe('A4')
    expect(base.metadata.orientation).toBe('LANDSCAPE')
    expect(base.metadata.documentType).toBe('proposal')
    expect(base.theme.id).toBe('warm_editorial')
    expect(base.theme.headingFont).toBe('Custom Heading')
    expect(base.theme.bodyFont).toBe('Custom Body')
  })

  it('should validate HeadingElement rules', () => {
    const validHeading = {
      id: mockUUID,
      type: 'heading',
      content: {
        level: 2,
        text: 'Valid heading content',
      },
    }
    expect(HeadingElement.safeParse(validHeading).success).toBe(true)

    // Heading with level 4 is invalid
    const invalidHeadingLevel = {
      id: mockUUID,
      type: 'heading',
      content: {
        level: 4,
        text: 'Invalid heading content',
      },
    }
    expect(HeadingElement.safeParse(invalidHeadingLevel).success).toBe(false)

    // Heading with text too long is invalid (limit: 300)
    const longText = 'a'.repeat(301)
    const invalidHeadingLength = {
      id: mockUUID,
      type: 'heading',
      content: {
        level: 1,
        text: longText,
      },
    }
    expect(HeadingElement.safeParse(invalidHeadingLength).success).toBe(false)
  })

  it('should validate ParagraphElement rules', () => {
    const validParagraph = {
      id: mockUUID,
      type: 'paragraph',
      content: {
        text: 'Plain text paragraph',
      },
    }
    expect(ParagraphElement.safeParse(validParagraph).success).toBe(true)

    // Text exceeds 2000 characters
    const longText = 'a'.repeat(2001)
    const invalidParagraph = {
      id: mockUUID,
      type: 'paragraph',
      content: {
        text: longText,
      },
    }
    expect(ParagraphElement.safeParse(invalidParagraph).success).toBe(false)
  })

  it('should validate CalloutElement rules', () => {
    const validCallout = {
      id: mockUUID,
      type: 'callout',
      content: {
        variant: 'insight',
        title: 'Deep Insight',
        text: 'This is a callout body.',
      },
    }
    expect(CalloutElement.safeParse(validCallout).success).toBe(true)

    // Invalid variant
    const invalidCallout = {
      id: mockUUID,
      type: 'callout',
      content: {
        variant: 'dangerous-warning',
        text: 'This is invalid.',
      },
    }
    expect(CalloutElement.safeParse(invalidCallout).success).toBe(false)
  })

  it('should load theme presets correctly', () => {
    expect(THEME_PRESETS.nordic_crisp).toBeDefined()
    expect(THEME_PRESETS.sleek_dark.mode).toBe('dark')
    expect(THEME_PRESETS.corporate_navy.headingFont).toBe('Outfit')
  })
})
