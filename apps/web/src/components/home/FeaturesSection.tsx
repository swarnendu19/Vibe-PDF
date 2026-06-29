import {
  Brain,
  Layers,
  Palette,
  FileCheck,
  Wand2,
  BarChart3,
  Type,
  Shield,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Multi-Agent Intelligence',
    description:
      'A coordinated team of specialized AI agents — Planner, Writer, Designer, Layout — each focused on a single task to ensure depth and quality at every stage.',
  },
  {
    icon: Type,
    title: 'Editorial Typography',
    description:
      'Documents use expertly paired fonts — Outfit headings, Lora body text — with baseline grid alignment, optical kerning, and orphan/widow prevention.',
  },
  {
    icon: Layers,
    title: 'Intelligent Page Layout',
    description:
      'A 12-column asymmetric grid engine with real-time overflow detection ensures every page maintains professional spacing and visual hierarchy.',
  },
  {
    icon: Palette,
    title: 'Five Editorial Themes',
    description:
      'Choose from Nordic Crisp, Warm Editorial, Sleek Dark, Corporate Navy, or Monochrome. Every theme is print-safe with correct CMYK color mappings.',
  },
  {
    icon: Wand2,
    title: 'Canvas Editor',
    description:
      'Edit any page independently without affecting the rest of your document. Rewrite a section, regenerate an infographic, or swap the theme — page by page.',
  },
  {
    icon: BarChart3,
    title: 'AI Illustrations & Diagrams',
    description:
      'Vector illustrations and technical diagrams are generated inline — all SVG, all theme-aware, all print-safe. No raster images, no blur, no pixelation.',
  },
  {
    icon: FileCheck,
    title: 'Quality Gate',
    description:
      'Every document passes a 9-point automated quality check before export — typography, layout, contrast, readability, and print-readiness. Score below 90? Regenerated.',
  },
  {
    icon: Shield,
    title: 'Print-Ready Export',
    description:
      'Export to web-optimised RGB PDF or print-ready CMYK with bleed, crop marks, and ICC profile injection. PDF/A-3a compliant with accessible tagging.',
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-background-secondary py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            Platform capabilities
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Built for enterprise-quality output
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted">
            Every architectural decision has been made to prioritize document quality over speed.
            The result is a system that thinks before it generates.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-medium"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Subtle accent top line */}
                <div
                  className="absolute top-0 left-0 h-0.5 w-0 rounded-b bg-accent transition-all duration-500 group-hover:w-full"
                  aria-hidden="true"
                />

                {/* Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
