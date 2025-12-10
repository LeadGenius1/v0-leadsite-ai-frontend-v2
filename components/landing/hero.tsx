import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12 sm:pt-14">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Handshake-tP7Hw5IdDvK9cNXlgyQRoe0D5mEwvG.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/70 to-[#030712]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 mb-5 sm:mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] sm:text-xs text-blue-400 font-medium">AI-POWERED LEAD GENERATION LIVE</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-5 leading-tight">
          Turn your website into a
          <br />
          <span className="gradient-text">lead generation machine.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-5 sm:mb-6 leading-relaxed px-4">
          AI-powered prospect discovery and personalized outreach. Install once, generate qualified leads forever. No
          manual work required.
        </p>

        {/* CTA */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-sm px-5 sm:px-6 py-4 sm:py-5 rounded-full font-medium"
            asChild
          >
            <Link href="/signup">
              Start Free Trial <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-10 sm:mt-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">10K+</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">5M+</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">Leads Generated</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">98%</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  )
}
