import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { DataStream } from "@/components/landing/data-stream"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CTA } from "@/components/landing/cta"
import { Pricing } from "@/components/landing/pricing"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030712]">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <DataStream />
        <HowItWorks />
        <CTA />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
