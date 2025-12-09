import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>LeadSite AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Sign In</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
