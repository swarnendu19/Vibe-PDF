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

declare global {
  // eslint-disable-next-line no-var
  var __jobRegistry: Map<string, JobRecord> | undefined
}

if (!global.__jobRegistry) {
  global.__jobRegistry = new Map<string, JobRecord>()
}

export const jobRegistry = global.__jobRegistry
