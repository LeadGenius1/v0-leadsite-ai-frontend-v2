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
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-3xl">
        {/* Glassmorphism Card */}
        <div className="relative rounded-2xl p-6 sm:p-8 lg:p-12 glass-card">
          {/* Glass reflection effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to scale your leads?
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-lg mx-auto">
              Start your free trial today. No credit card required. See qualified leads in your dashboard within 24
              hours.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
              <Input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm h-11 sm:h-12"
              />
              <Button
                type="submit"
                className="bg-white text-gray-900 hover:bg-gray-100 font-medium text-sm h-11 sm:h-12 px-6"
              >
                Start Free Trial
              </Button>
            </form>

            <p className="text-xs text-gray-500">No credit card required. 14-day free trial for all plans.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
