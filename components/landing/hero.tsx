"use client"

import Link from "next/link"
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
          <Link href="/signup" className="inline-block">
            <style jsx>{`
              @property --gradient-angle {
                syntax: "<angle>";
                initial-value: 0deg;
                inherits: false;
              }

              @property --gradient-angle-offset {
                syntax: "<angle>";
                initial-value: 0deg;
                inherits: false;
              }

              @property --gradient-percent {
                syntax: "<percentage>";
                initial-value: 20%;
                inherits: false;
              }

              @property --gradient-shine {
                syntax: "<color>";
                initial-value: #8484ff;
                inherits: false;
              }

              .shiny-cta {
                --gradient-angle: 0deg;
                --gradient-angle-offset: 0deg;
                --gradient-percent: 20%;
                --gradient-shine: #8484ff;
                --shadow-size: 2px;
                position: relative;
                overflow: hidden;
                border-radius: 9999px;
                padding: 1rem 2rem;
                font-size: 0.875rem;
                line-height: 1.2;
                font-weight: 500;
                color: #ffffff;
                background: linear-gradient(#000000, #000000) padding-box,
                  conic-gradient(
                      from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
                      transparent 0%,
                      #1d4ed8 5%,
                      var(--gradient-shine) 15%,
                      #1d4ed8 30%,
                      transparent 40%,
                      transparent 100%
                    )
                    border-box;
                border: 2px solid transparent;
                box-shadow: inset 0 0 0 1px #1a1818;
                outline: none;
                transition: --gradient-angle-offset 800ms cubic-bezier(0.25, 1, 0.5, 1),
                  --gradient-percent 800ms cubic-bezier(0.25, 1, 0.5, 1),
                  --gradient-shine 800ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s;
                cursor: pointer;
                isolation: isolate;
                outline-offset: 4px;
                font-family: "Inter", "Helvetica Neue", sans-serif;
                z-index: 0;
                animation: border-spin 2.5s linear infinite;
              }

              @keyframes border-spin {
                to {
                  --gradient-angle: 360deg;
                }
              }

              .shiny-cta:active {
                transform: translateY(1px);
              }

              .shiny-cta::before {
                content: "";
                pointer-events: none;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 0;
                --size: calc(100% - 6px);
                --position: 2px;
                --space: 4px;
                width: var(--size);
                height: var(--size);
                background: radial-gradient(circle at var(--position) var(--position), white 0.5px, transparent 0)
                  padding-box;
                background-size: var(--space) var(--space);
                background-repeat: space;
                mask-image: conic-gradient(
                  from calc(var(--gradient-angle) + 45deg),
                  black,
                  transparent 10% 90%,
                  black
                );
                border-radius: inherit;
                opacity: 0.4;
                pointer-events: none;
              }

              .shiny-cta::after {
                content: "";
                pointer-events: none;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 1;
                width: 100%;
                aspect-ratio: 1;
                background: linear-gradient(-50deg, transparent, #1d4ed8, transparent);
                mask-image: radial-gradient(circle at bottom, transparent 40%, black);
                opacity: 0.6;
                animation: shimmer 4s linear infinite;
                animation-play-state: running;
              }

              .shiny-cta span {
                position: relative;
                z-index: 2;
                display: inline-block;
              }

              .shiny-cta span::before {
                content: "";
                pointer-events: none;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: -1;
                --size: calc(100% + 1rem);
                width: var(--size);
                height: var(--size);
                box-shadow: inset 0 -1ex 2rem 4px #1d4ed8;
                opacity: 0;
                border-radius: inherit;
                transition: opacity 800ms cubic-bezier(0.25, 1, 0.5, 1);
                animation: breathe 4.5s linear infinite;
              }

              @keyframes shimmer {
                to {
                  transform: translate(-50%, -50%) rotate(360deg);
                }
              }

              @keyframes breathe {
                0%,
                100% {
                  transform: translate(-50%, -50%) scale(1);
                }

                50% {
                  transform: translate(-50%, -50%) scale(1.2);
                }
              }

              @media (min-width: 640px) {
                .shiny-cta {
                  padding: 1.25rem 2.5rem;
                  font-size: 1rem;
                }
              }
            `}</style>
            <button className="shiny-cta focus:outline-none">
              <span>Start Free Trial</span>
              <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </Link>
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
