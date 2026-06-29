import express from 'express'
import { renderDocumentToPDF } from './printer'

const app = express()
const port = process.env.COMPILER_PORT || 8081

app.use(express.json({ limit: '50mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/compile', async (req, res) => {
  const { documentAST } = req.body

  if (!documentAST) {
    res.status(400).json({ error: 'Missing documentAST in request body' })
    return
  }

  try {
    const pdfBuffer = await renderDocumentToPDF(documentAST)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(pdfBuffer)
  } catch (err) {
    console.error('[compiler] PDF render failed:', err)
    res.status(500).json({ error: 'PDF generation failed', detail: String(err) })
  }
})

app.listen(port, () => {
  console.log(`[compiler] PDF compilation service listening on port ${port}`)
})
