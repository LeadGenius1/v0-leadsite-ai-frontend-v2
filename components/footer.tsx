import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>LeadSite AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">Intelligent lead management for modern sales teams.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#integrations" className="text-muted-foreground hover:text-foreground transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/#changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/#careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/#terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 LeadSite AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
