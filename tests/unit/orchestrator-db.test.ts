import { describe, it, expect, beforeAll } from 'vitest'
import { initDb, saveJob, getJob, getJobByDocumentId, JobRecord } from '../../services/orchestrator/src/database/db'

describe('Orchestrator Database Handler (In-Memory Fallback)', () => {
  beforeAll(async () => {
    // Initialize database. Since we don't have Postgres running, this will trigger the in-memory fallback.
    await initDb()
  })

  it('should save and retrieve a job record', async () => {
    const job: JobRecord = {
      jobId: 'job-12345',
      documentId: 'doc-12345',
      status: 'QUEUED',
      currentStage: 'PLANNING',
      progress: 0,
      prompt: 'Create a whitepaper on decentralized finance.',
      documentType: 'whitepaper',
      pageBudget: 5,
      theme: 'nordic_crisp',
      createdAt: new Date().toISOString(),
    }

    await saveJob(job)

    const retrieved = await getJob('job-12345')
    expect(retrieved).toBeDefined()
    expect(retrieved?.jobId).toBe('job-12345')
    expect(retrieved?.documentId).toBe('doc-12345')
    expect(retrieved?.status).toBe('QUEUED')
    expect(retrieved?.prompt).toBe('Create a whitepaper on decentralized finance.')
  })

  it('should get job by document ID', async () => {
    const retrieved = await getJobByDocumentId('doc-12345')
    expect(retrieved).toBeDefined()
    expect(retrieved?.jobId).toBe('job-12345')
  })

  it('should update and save changes to an existing job', async () => {
    const job = await getJob('job-12345')
    expect(job).toBeDefined()

    if (job) {
      job.status = 'RUNNING'
      job.currentStage = 'WRITING'
      job.progress = 40
      await saveJob(job)
    }

    const updated = await getJob('job-12345')
    expect(updated?.status).toBe('RUNNING')
    expect(updated?.currentStage).toBe('WRITING')
    expect(updated?.progress).toBe(40)
  })

  it('should return undefined for non-existent job ID', async () => {
    const job = await getJob('non-existent-id')
    expect(job).toBeUndefined()
  })
})
