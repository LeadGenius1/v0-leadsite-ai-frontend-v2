import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { DataStream } from "@/components/landing/data-stream"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Deliverability } from "@/components/landing/deliverability"
import { ControlModes } from "@/components/landing/control-modes"
import { Integrations } from "@/components/landing/integrations"
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
        <Deliverability />
        <ControlModes />
        <Integrations />
        <CTA />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
