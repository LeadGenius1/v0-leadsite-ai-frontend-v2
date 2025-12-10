import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600" />
            <span className="text-sm sm:text-base font-bold text-white">LEADSITE.AI</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/privacy" className="text-[10px] sm:text-xs text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] sm:text-xs text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-[10px] sm:text-xs text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-[10px] sm:text-xs text-gray-500">© 2025 LeadSite.AI. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
