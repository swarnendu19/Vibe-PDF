import type { Metadata, Viewport } from 'next'
import { Outfit, Lora, IBM_Plex_Mono } from 'next/font/google'
import '@/styles/globals.css'

// ─────────────────────────────────────────────────────────────────────────────
// FONTS — loaded via next/font for performance and print consistency
// ─────────────────────────────────────────────────────────────────────────────

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'PublishEngine — AI-Native PDF Publishing',
    template: '%s | PublishEngine',
  },
  description:
    'Generate enterprise-quality PDF documents from a single prompt. Professional typography, intelligent layouts, and editorial-grade design — powered by AI.',
  keywords: [
    'AI PDF generator',
    'document automation',
    'AI publishing',
    'PDF design',
    'document generation',
  ],
  authors: [{ name: 'PublishEngine' }],
  openGraph: {
    title: 'PublishEngine — AI-Native PDF Publishing',
    description: 'Enterprise-quality PDFs from a single prompt.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fb' },
    { media: '(prefers-color-scheme: dark)', color: '#14141a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="nordic_crisp"
      className={`${outfit.variable} ${lora.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
