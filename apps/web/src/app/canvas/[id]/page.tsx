import type { Metadata } from 'next'
import { CanvasEditor } from '@/components/canvas/CanvasEditor'

export const metadata: Metadata = {
  title: 'Canvas Editor',
  description: 'Review and edit your AI-generated PDF document.',
}

// Next.js 15: params is a Promise in async server components
export default async function CanvasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CanvasEditor documentId={id} />
}
