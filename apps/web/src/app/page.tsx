import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { TemplateGallery } from '@/components/home/TemplateGallery'
import { HowItWorks } from '@/components/home/HowItWorks'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  title: 'PublishEngine — AI-Native PDF Publishing',
  description:
    'Generate enterprise-quality PDF documents from a single prompt. Professional typography, intelligent layouts, and editorial-grade design — powered by AI.',
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <TemplateGallery />
      </main>
      <SiteFooter />
    </div>
  )
}
