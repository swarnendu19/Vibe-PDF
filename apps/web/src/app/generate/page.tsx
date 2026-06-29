import type { Metadata } from 'next'
import { GeneratePageClient } from '@/components/generate/GeneratePageClient'

export const metadata: Metadata = {
  title: 'Generate Document',
  description: 'Configure and generate your AI-powered PDF document.',
}

export default function GeneratePage() {
  return <GeneratePageClient />
}
