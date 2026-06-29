import Link from 'next/link'
import { FileText, Github } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
                <FileText className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-heading text-sm font-semibold text-foreground">
                PublishEngine
              </span>
            </div>
            <p className="mt-3 font-body text-xs leading-relaxed text-muted">
              AI-native PDF publishing. Enterprise-quality documents from a single prompt.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {['Features', 'Templates', 'Pricing', 'Changelog'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="font-body text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="font-body text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {['Privacy', 'Terms', 'Security', 'Cookies'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="font-body text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="font-body text-xs text-muted">
            © {new Date().getFullYear()} PublishEngine. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
