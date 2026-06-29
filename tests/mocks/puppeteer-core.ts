import { vi } from 'vitest'

const mockPage = {
  setViewport: vi.fn().mockResolvedValue(undefined),
  setContent: vi.fn().mockResolvedValue(undefined),
  pdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock pdf from puppeteer')),
}

const mockBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPage),
  close: vi.fn().mockResolvedValue(undefined),
}

export default {
  launch: vi.fn().mockImplementation(async (options) => {
    if (options?.executablePath === 'fail-path') {
      throw new Error('Launch failed')
    }
    return mockBrowser
  })
}
