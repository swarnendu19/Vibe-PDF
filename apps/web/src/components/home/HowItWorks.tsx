import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Describe your document',
    description:
      'Tell the system what you need. Be specific — mention the audience, tone, length, and purpose. The more detail, the better the result.',
    example: '"6-page SaaS competitive analysis targeting Series A investors, formal tone"',
  },
  {
    number: '02',
    title: 'AI agents plan and write',
    description:
      'The Planner Agent structures your document. The Research Agent finds relevant patterns. The Writer Agent produces editorial-quality content, not filler.',
    example: 'Planner → Research → Outline → Writer (all in under 40 seconds)',
  },
  {
    number: '03',
    title: 'Layout and design applied',
    description:
      'Typography, illustrations, diagrams, and layout are applied by dedicated agents. A 12-column baseline grid ensures consistent, professional spacing.',
    example: 'Typography → Illustration → Layout → Quality Check',
  },
  {
    number: '04',
    title: 'Review and export',
    description:
      'Your document passes a 9-point quality check. Then edit any page independently in the canvas editor, or export immediately as a print-ready PDF.',
    example: 'Score: 96/100 — Print-ready CMYK PDF generated',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-background py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            From prompt to PDF in four steps
          </h2>
        </div>

        {/* Steps */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute top-8 left-[calc(100%+0.5rem)] hidden h-px w-[calc(100%-1rem)] items-center lg:flex"
                    aria-hidden="true"
                  >
                    <div className="h-px w-full border-t border-dashed border-border" />
                    <ArrowRight className="absolute right-0 -mt-px h-3 w-3 -translate-y-0.5 text-muted" />
                  </div>
                )}

                {/* Step number */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-accent-subtle">
                    <span className="font-heading text-xs font-bold text-accent">{step.number}</span>
                  </div>
                  <div className="h-px flex-1 border-t border-dashed border-border lg:hidden" />
                </div>

                {/* Content */}
                <div className="mt-5">
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>

                  {/* Example callout */}
                  <div className="mt-4 rounded-md border border-border bg-background-secondary px-3 py-2.5">
                    <p className="font-mono text-xs leading-relaxed text-muted">
                      {step.example}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
