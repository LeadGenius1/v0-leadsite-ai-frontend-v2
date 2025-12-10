"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-white/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 animate-pulse-glow" />
            <span className="text-base sm:text-lg font-bold text-white">LEADSITE.AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="#features" className="text-xs text-gray-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-xs text-gray-400 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-xs text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-xs px-3 py-1.5 bg-transparent"
              asChild
            >
              <Link href="/login">Client Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10">
            <div className="flex flex-col gap-3">
              <Link href="#features" className="text-xs text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-xs text-gray-400 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-xs text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs w-full bg-transparent"
                asChild
              >
                <Link href="/login">Client Login</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
