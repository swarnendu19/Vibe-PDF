import { describe, it, expect } from 'vitest'
import { spacing, typography, pageDimensions, margins, grid, quality, bannedWords } from '../../packages/design-tokens/src/index'

describe('Design Tokens', () => {
  it('should have a valid spacing scale', () => {
    expect(spacing).toBeDefined()
    expect(spacing.xs).toBe('3pt')
    expect(spacing.sm).toBe('6pt')
    expect(spacing.md).toBe('12pt')
    expect(spacing.lg).toBe('18pt')
    expect(spacing.xl).toBe('24pt')
    expect(spacing['2xl']).toBe('36pt')
    expect(spacing['3xl']).toBe('48pt')
  })

  it('should have correct typography scale', () => {
    expect(typography.fonts.heading).toBe('Outfit')
    expect(typography.fonts.body).toBe('Lora')
    expect(typography.fonts.mono).toBe('IBM Plex Mono')

    expect(typography.sizes.body).toBe('10pt')
    expect(typography.sizes.title).toBe('32pt')

    expect(typography.lineHeights.body).toBe('16pt')
    expect(typography.lineHeights.title).toBe('40pt')
  })

  it('should have correct page dimensions', () => {
    expect(pageDimensions.letter).toEqual({ width: 612, height: 792, unit: 'pt' })
    expect(pageDimensions.a4).toEqual({ width: 595, height: 842, unit: 'pt' })
    expect(pageDimensions.legal).toEqual({ width: 612, height: 1008, unit: 'pt' })
  })

  it('should have correct margins', () => {
    expect(margins.portrait.top).toBe(63)
    expect(margins.portrait.bottom).toBe(72)
    expect(margins.portrait.outer).toBe(54)

    expect(margins.landscape.top).toBe(54)
    expect(margins.landscape.bottom).toBe(63)
    expect(margins.landscape.outer).toBe(72)
  })

  it('should define grid settings', () => {
    expect(grid.columns).toBe(12)
    expect(grid.gutterPt).toBe(12)
    expect(grid.baselinePt).toBe(4)
  })

  it('should define quality standards', () => {
    expect(quality.minimumScore).toBe(90)
    expect(quality.contrastRatio).toBe(7)
    expect(quality.minNegativeSpacePercent).toBe(25)
  })

  it('should list AI-banned words', () => {
    expect(bannedWords).toContain('delve')
    expect(bannedWords).toContain('tapestry')
    expect(bannedWords).toContain('testament')
    expect(bannedWords).toContain('leverage')
    expect(bannedWords).toContain('synergy')
    expect(bannedWords).toContain('game-changer')
  })
})
