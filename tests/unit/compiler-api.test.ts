import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'

// Mock the printer module to avoid launching real Puppeteer browser
vi.mock('../../services/compiler/src/printer', () => {
  return {
    renderDocumentToPDF: vi.fn().mockImplementation(async (doc: any) => {
      if (doc?.id === 'trigger-failure-uuid') {
        throw new Error('Puppeteer simulated launch failure')
      }
      return Buffer.from('%PDF-1.4 mock pdf payload')
    })
  }
})

// Now import app after mocking
import { app } from '../../services/compiler/src/index'

describe('Compiler API Endpoints', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test'
  })

  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('POST /compile should compile PDF and return binary stream', async () => {
    const validAST = {
      id: 'doc-id-123',
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Compile Test Doc',
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
      pages: [],
    }

    const res = await request(app)
      .post('/compile')
      .send({ documentAST: validAST })

    expect(res.status).toBe(200)
    expect(res.header['content-type']).toBe('application/pdf')
    expect(res.body).toBeInstanceOf(Buffer)
    expect(res.body.toString()).toBe('%PDF-1.4 mock pdf payload')
  })

  it('POST /compile should return 400 Bad Request if documentAST is missing', async () => {
    const res = await request(app)
      .post('/compile')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Missing documentAST in request body')
  })

  it('POST /compile should return 500 if PDF generation fails', async () => {
    const failureAST = {
      id: 'trigger-failure-uuid',
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Error Doc',
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
      pages: [],
    }

    const res = await request(app)
      .post('/compile')
      .send({ documentAST: failureAST })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('PDF generation failed')
    expect(res.body.detail).toBe('Error: Puppeteer simulated launch failure')
  })
})
