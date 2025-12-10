"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CTA() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Email submitted:", email)
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-3xl">
        {/* Glassmorphism Card */}
        <div className="relative rounded-2xl p-5 sm:p-6 lg:p-10 glass-card">
          {/* Glass reflection effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
              Ready to scale your leads?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mb-5 sm:mb-6 max-w-lg mx-auto">
              Start your free trial today. No credit card required. See qualified leads in your dashboard within 24
              hours.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-3">
              <Input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs h-9 sm:h-10"
              />
              <Button
                type="submit"
                className="bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs h-9 sm:h-10 px-5"
              >
                Start Free Trial
              </Button>
            </form>

            <p className="text-[10px] text-gray-500">No credit card required. 14-day free trial for all plans.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
