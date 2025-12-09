import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Handshake-tP7Hw5IdDvK9cNXlgyQRoe0D5mEwvG.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/70 to-[#030712]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6 sm:mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs sm:text-sm text-blue-400 font-medium">AI-POWERED LEAD GENERATION LIVE</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Turn your website into a
          <br />
          <span className="gradient-text">lead generation machine.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
          AI-powered prospect discovery and personalized outreach. Install once, generate qualified leads forever. No
          manual work required.
        </p>

        {/* CTA */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-full font-medium"
            asChild
          >
            <Link href="/signup">
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">10K+</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">5M+</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Leads Generated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">98%</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  )
}
