import { Pool } from 'pg'
import type { DocumentAST } from '@repo/document-model'

export interface JobRecord {
  jobId: string
  documentId: string
  status: string
  currentStage: string
  progress: number
  prompt: string
  documentType: string
  pageBudget: number
  theme: string
  createdAt: string
  documentAST?: unknown
  error?: string
}

let pool: Pool | null = null
let useInMemory = false
const inMemoryJobs = new Map<string, JobRecord>()

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/publishengine'

export async function initDb() {
  const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL
  console.log(`[db] Initializing database connection...`)

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    })

    // Test the connection
    const client = await pool.connect()
    console.log('[db] Successfully connected to PostgreSQL')
    
    // Create tables according to DATABASE_SCHEMA.md + jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        theme JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY,
        document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
        page_number INTEGER NOT NULL,
        layout_variant VARCHAR(50) NOT NULL,
        header_text VARCHAR(255),
        footer_text VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_document_page UNIQUE (document_id, page_number)
      );

      CREATE TABLE IF NOT EXISTS elements (
        id UUID PRIMARY KEY,
        page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
        element_type VARCHAR(50) NOT NULL,
        style_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
        content JSONB NOT NULL,
        sort_order INTEGER NOT NULL,
        CONSTRAINT unique_page_element_order UNIQUE (page_id, sort_order)
      );

      CREATE TABLE IF NOT EXISTS jobs (
        job_id UUID PRIMARY KEY,
        document_id UUID NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_stage VARCHAR(50) NOT NULL,
        progress INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        page_budget INTEGER NOT NULL,
        theme VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        error TEXT,
        document_ast JSONB
      );

      CREATE INDEX IF NOT EXISTS idx_pages_document_id ON pages(document_id);
      CREATE INDEX IF NOT EXISTS idx_elements_page_id ON elements(page_id);
      CREATE INDEX IF NOT EXISTS idx_elements_type ON elements(element_type);
    `)
    client.release()
    console.log('[db] Database schema verified successfully.')
  } catch (err) {
    console.warn('[db] PostgreSQL initialization failed, falling back to in-memory registry. Error:', err)
    useInMemory = true
  }
}

export async function saveJob(job: JobRecord): Promise<void> {
  if (useInMemory || !pool) {
    inMemoryJobs.set(job.jobId, job)
    return
  }

  try {
    await pool.query(
      `INSERT INTO jobs (job_id, document_id, status, current_stage, progress, prompt, document_type, page_budget, theme, error, document_ast)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (job_id) DO UPDATE SET
         status = EXCLUDED.status,
         current_stage = EXCLUDED.current_stage,
         progress = EXCLUDED.progress,
         error = EXCLUDED.error,
         document_ast = EXCLUDED.document_ast`,
      [
        job.jobId,
        job.documentId,
        job.status,
        job.currentStage,
        job.progress,
        job.prompt,
        job.documentType,
        job.pageBudget,
        job.theme,
        job.error || null,
        job.documentAST ? JSON.stringify(job.documentAST) : null,
      ]
    )

    // If job is complete, also persist it into the documents, pages, and elements tables
    if (job.status === 'COMPLETE' && job.documentAST) {
      await saveDocumentAST(job.documentId, job.documentAST as DocumentAST)
    }
  } catch (err) {
    console.error('[db] Error saving job:', err)
    // Backup fallback to memory
    inMemoryJobs.set(job.jobId, job)
  }
}

export async function getJob(jobId: string): Promise<JobRecord | undefined> {
  if (useInMemory || !pool) {
    return inMemoryJobs.get(jobId)
  }

  try {
    const res = await pool.query('SELECT * FROM jobs WHERE job_id = $1', [jobId])
    if (res.rows.length === 0) {
      return inMemoryJobs.get(jobId)
    }

    const row = res.rows[0]
    return {
      jobId: row.job_id,
      documentId: row.document_id,
      status: row.status,
      currentStage: row.current_stage,
      progress: row.progress,
      prompt: row.prompt,
      documentType: row.document_type,
      pageBudget: row.page_budget,
      theme: row.theme,
      createdAt: row.created_at.toISOString(),
      error: row.error || undefined,
      documentAST: row.document_ast || undefined,
    }
  } catch (err) {
    console.error('[db] Error getting job:', err)
    return inMemoryJobs.get(jobId)
  }
}

export async function getJobByDocumentId(documentId: string): Promise<JobRecord | undefined> {
  if (useInMemory || !pool) {
    return Array.from(inMemoryJobs.values()).find((j) => j.documentId === documentId)
  }

  try {
    const res = await pool.query('SELECT * FROM jobs WHERE document_id = $1', [documentId])
    if (res.rows.length === 0) {
      return Array.from(inMemoryJobs.values()).find((j) => j.documentId === documentId)
    }

    const row = res.rows[0]
    return {
      jobId: row.job_id,
      documentId: row.document_id,
      status: row.status,
      currentStage: row.current_stage,
      progress: row.progress,
      prompt: row.prompt,
      documentType: row.document_type,
      pageBudget: row.page_budget,
      theme: row.theme,
      createdAt: row.created_at.toISOString(),
      error: row.error || undefined,
      documentAST: row.document_ast || undefined,
    }
  } catch (err) {
    console.error('[db] Error getting job by document ID:', err)
    return Array.from(inMemoryJobs.values()).find((j) => j.documentId === documentId)
  }
}

export async function saveDocumentAST(documentId: string, ast: DocumentAST): Promise<void> {
  if (useInMemory || !pool) {
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Insert/Update Document
    await client.query(
      `INSERT INTO documents (id, title, metadata, theme)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         metadata = EXCLUDED.metadata,
         theme = EXCLUDED.theme,
         updated_at = CURRENT_TIMESTAMP`,
      [
        documentId,
        ast.metadata.title,
        JSON.stringify(ast.metadata),
        JSON.stringify(ast.theme),
      ]
    )

    // 2. Insert/Update Pages and elements
    for (const page of ast.pages) {
      await client.query(
        `INSERT INTO pages (id, document_id, page_number, layout_variant)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (document_id, page_number) DO UPDATE SET
           layout_variant = EXCLUDED.layout_variant`,
        [
          page.id,
          documentId,
          page.pageNumber,
          page.layoutVariant,
        ]
      )

      // Delete old elements for this page to handle replacement
      await client.query('DELETE FROM elements WHERE page_id = $1', [page.id])

      // Insert elements
      for (let sortOrder = 0; sortOrder < page.elements.length; sortOrder++) {
        const el = page.elements[sortOrder]!
        await client.query(
          `INSERT INTO elements (id, page_id, element_type, content, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            el.id,
            page.id,
            el.type,
            JSON.stringify(el.content),
            sortOrder,
          ]
        )
      }
    }

    await client.query('COMMIT')
    console.log(`[db] Successfully persisted document AST ${documentId} to relational tables.`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[db] Error in saveDocumentAST transaction:', err)
  } finally {
    client.release()
  }
}
