import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const templates = [
  {
    id: 'playbook',
    label: 'Playbook',
    theme: 'Nordic Crisp',
    pages: '8–12 pages',
    description: 'Internal processes, best practices, onboarding guides',
    accentColor: 'hsl(215 90% 52%)',
    bgColor: 'hsl(215 90% 96%)',
    tags: ['Process', 'Internal', 'Ops'],
  },
  {
    id: 'case_study',
    label: 'Case Study',
    theme: 'Warm Editorial',
    pages: '4–8 pages',
    description: 'Customer success stories, project results, impact analysis',
    accentColor: 'hsl(25 80% 48%)',
    bgColor: 'hsl(25 80% 96%)',
    tags: ['Marketing', 'Sales', 'External'],
  },
  {
    id: 'report',
    label: 'Report',
    theme: 'Corporate Navy',
    pages: '10–20 pages',
    description: 'Quarterly metrics, market analysis, performance review',
    accentColor: 'hsl(222 72% 32%)',
    bgColor: 'hsl(222 72% 96%)',
    tags: ['Executive', 'Data', 'Finance'],
  },
  {
    id: 'technical_docs',
    label: 'Technical Docs',
    theme: 'Monochrome',
    pages: '6–15 pages',
    description: 'Architecture diagrams, API docs, engineering specifications',
    accentColor: 'hsl(0 0% 10%)',
    bgColor: 'hsl(0 0% 95%)',
    tags: ['Engineering', 'Architecture', 'API'],
  },
  {
    id: 'proposal',
    label: 'Proposal',
    theme: 'Nordic Crisp',
    pages: '4–8 pages',
    description: 'Project proposals, service offerings, scope of work',
    accentColor: 'hsl(215 90% 52%)',
    bgColor: 'hsl(215 90% 96%)',
    tags: ['Sales', 'Client', 'Business'],
  },
  {
    id: 'whitepaper',
    label: 'Whitepaper',
    theme: 'Sleek Dark',
    pages: '10–25 pages',
    description: 'Research findings, thought leadership, industry analysis',
    accentColor: 'hsl(263 85% 68%)',
    bgColor: 'hsl(263 85% 96%)',
    tags: ['Research', 'Industry', 'Leadership'],
  },
]

export function TemplateGallery() {
  return (
    <section
      id="templates"
      className="bg-background py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
              Document types
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Every format, professionally executed
            </h2>
          </div>
          <Link
            href="/generate"
            className="flex items-center gap-2 font-heading text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Browse all templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Template cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TemplateCard({
  template,
}: {
  template: (typeof templates)[number]
}) {
  return (
    <Link
      href={`/generate?type=${template.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-medium"
    >
      {/* Preview area */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{ backgroundColor: template.bgColor }}
      >
        {/* Simulated document thumbnail */}
        <div className="page-shadow relative h-32 w-24 rounded-md bg-white p-3">
          <div
            className="mb-2 h-1 w-6 rounded-full"
            style={{ backgroundColor: template.accentColor }}
          />
          <div className="mb-1.5 space-y-1">
            <div className="h-1.5 w-full rounded bg-gray-200" />
            <div className="h-1.5 w-3/4 rounded bg-gray-200" />
          </div>
          <div
            className="my-2 h-8 w-full rounded"
            style={{ backgroundColor: template.bgColor }}
          />
          <div className="space-y-1">
            <div className="h-1 w-full rounded bg-gray-100" />
            <div className="h-1 w-full rounded bg-gray-100" />
            <div className="h-1 w-2/3 rounded bg-gray-100" />
          </div>
        </div>

        {/* Theme badge */}
        <div className="absolute top-3 right-3 rounded-md border border-border/40 bg-white/70 px-2 py-1 backdrop-blur-sm">
          <span className="font-heading text-xs font-medium" style={{ color: template.accentColor }}>
            {template.theme}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            {template.label}
          </h3>
          <span className="font-body text-xs text-muted">{template.pages}</span>
        </div>
        <p className="mt-1.5 font-body text-sm leading-relaxed text-muted">
          {template.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border px-2 py-0.5 font-heading text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Hover CTA */}
        <div className="mt-4 flex items-center gap-1 font-heading text-xs font-medium text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Generate this type
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  )
}
