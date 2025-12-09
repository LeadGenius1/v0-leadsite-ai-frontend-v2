import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600" />
            <span className="text-base sm:text-lg font-bold text-white">LEADSITE.AI</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs sm:text-sm text-gray-500">© 2025 LeadSite.AI. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
