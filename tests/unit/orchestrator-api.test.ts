import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../services/orchestrator/src/index'
import { initDb, saveJob, JobRecord } from '../../services/orchestrator/src/database/db'

describe('Orchestrator API Endpoints', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000'

  beforeAll(async () => {
    // Set environment variable to avoid starting real server inside imports
    process.env.NODE_ENV = 'test'
    await initDb()
  })

  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('POST /api/v1/documents should create a job with valid payload', async () => {
    const payload = {
      prompt: 'Write an editorial playbook for developers on React Server Components',
      document_type: 'playbook',
      page_budget: 4,
      theme: 'sleek_dark',
    }

    const res = await request(app)
      .post('/api/v1/documents')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body.job_id).toBeDefined()
    expect(res.body.document_id).toBeDefined()
    expect(res.body.status).toBe('QUEUED')
    expect(res.body.current_stage).toBe('PLANNING')
  })

  it('POST /api/v1/documents should reject invalid payloads', async () => {
    const invalidPayload = {
      prompt: 'short', // prompt must be min 10 chars
      document_type: 'invalid_type',
      page_budget: 1, // min is 2
      theme: 'monochrome',
    }

    const res = await request(app)
      .post('/api/v1/documents')
      .send(invalidPayload)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
    expect(res.body.issues).toBeDefined()
  })

  it('GET /api/v1/documents/:id should return 404 if not found', async () => {
    const res = await request(app).get('/api/v1/documents/non-existent-uuid')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Document or job not found')
  })

  it('GET /api/v1/documents/:id should return job status and progress for active job', async () => {
    const jobId = 'active-job-id'
    const docId = 'active-doc-id'
    const job: JobRecord = {
      jobId,
      documentId: docId,
      status: 'RUNNING',
      currentStage: 'WRITING',
      progress: 45,
      prompt: 'Active job prompt',
      documentType: 'report',
      pageBudget: 5,
      theme: 'monochrome',
      createdAt: new Date().toISOString(),
    }

    await saveJob(job)

    const res = await request(app).get(`/api/v1/documents/${jobId}`)
    expect(res.status).toBe(202)
    expect(res.body.status).toBe('RUNNING')
    expect(res.body.stage).toBe('WRITING')
    expect(res.body.progress).toBe(45)
  })

  it('PUT /api/v1/documents/:id should save updated documentAST', async () => {
    const docId = 'save-doc-id'
    const jobId = 'save-job-id'
    const job: JobRecord = {
      jobId,
      documentId: docId,
      status: 'COMPLETE',
      currentStage: 'COMPLETE',
      progress: 100,
      prompt: 'Save document prompt',
      documentType: 'report',
      pageBudget: 5,
      theme: 'monochrome',
      createdAt: new Date().toISOString(),
    }

    await saveJob(job)

    const updatedAST = {
      id: docId,
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Updated Title via API',
        paperSize: 'LETTER',
        orientation: 'PORTRAIT',
        documentType: 'report',
      },
      theme: {
        id: 'monochrome',
        headingFont: 'Inter',
        bodyFont: 'Inter',
        monoFont: 'Roboto Mono',
        accentColor: '0 0% 10%',
        mode: 'light',
      },
      pages: [],
    }

    const res = await request(app)
      .put(`/api/v1/documents/${docId}`)
      .send({ documentAST: updatedAST })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.documentId).toBe(docId)

    // Retrieve again to verify AST is updated
    const getRes = await request(app).get(`/api/v1/documents/${docId}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.status).toBe('COMPLETE')
    expect(getRes.body.document).toBeDefined()
    expect(getRes.body.document.metadata.title).toBe('Updated Title via API')
  })

  it('POST /api/v1/documents/:id/pages/:pageId/edit should reject invalid edit action payloads', async () => {
    const res = await request(app)
      .post(`/api/v1/documents/${mockUUID}/pages/page-uuid/edit`)
      .send({ action: 'INVALID_ACTION' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
  })

  it('POST /api/v1/documents/:id/pages/:pageId/edit should handle valid edit actions', async () => {
    const docId = 'edit-doc-id'
    const jobId = 'edit-job-id'
    const job: JobRecord = {
      jobId,
      documentId: docId,
      status: 'COMPLETE',
      currentStage: 'COMPLETE',
      progress: 100,
      prompt: 'Edit document prompt',
      documentType: 'report',
      pageBudget: 5,
      theme: 'monochrome',
      createdAt: new Date().toISOString(),
      documentAST: {
        id: docId,
        schemaVersion: '1.0.0',
        metadata: {
          title: 'Document before edit',
          paperSize: 'LETTER',
          orientation: 'PORTRAIT',
          documentType: 'report',
        },
        theme: {
          id: 'monochrome',
          headingFont: 'Inter',
          bodyFont: 'Inter',
          monoFont: 'Roboto Mono',
          accentColor: '0 0% 10%',
          mode: 'light',
        },
        pages: [{ id: 'page-1', pageNumber: 1, layoutVariant: 'cover', elements: [] }],
      }
    }

    await saveJob(job)

    const res = await request(app)
      .post(`/api/v1/documents/${docId}/pages/page-1/edit`)
      .send({ action: 'EDIT_TEXT', payload: { text: 'New content' } })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.action).toBe('EDIT_TEXT')
    expect(res.body.pageId).toBe('page-1')
  })
})
