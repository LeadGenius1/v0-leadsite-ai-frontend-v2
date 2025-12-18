"use client"

import Link from "next/link"

export function CTA() {
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
              Start your free trial today. No credit card required. Enter your website URL and see prospects in your
              dashboard within minutes.
            </p>

            <div className="flex justify-center mb-3">
              <Link href="/signup">
                <style jsx>{`
                  @property --gradient-angle {
                    syntax: "<angle>";
                    initial-value: 0deg;
                    inherits: false;
                  }

                  .shiny-cta {
                    --gradient-angle: 0deg;
                    position: relative;
                    overflow: hidden;
                    border-radius: 9999px;
                    padding: 0.75rem 2rem;
                    font-size: 0.875rem;
                    line-height: 1.2;
                    font-weight: 500;
                    color: #ffffff;
                    background: linear-gradient(#000000, #000000) padding-box,
                      conic-gradient(from var(--gradient-angle), transparent 0%, #1d4ed8 5%, #8484ff 15%, #1d4ed8 30%, transparent 40%)
                        border-box;
                    border: 2px solid transparent;
                    box-shadow: inset 0 0 0 1px #1a1818;
                    cursor: pointer;
                    font-family: "Inter", "Helvetica Neue", sans-serif;
                    animation: border-spin 2.5s linear infinite;
                    white-space: nowrap;
                    display: inline-block;
                  }

                  @keyframes border-spin {
                    to {
                      --gradient-angle: 360deg;
                    }
                  }

                  .shiny-cta::after {
                    content: "";
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    aspect-ratio: 1;
                    background: linear-gradient(-50deg, transparent, #1d4ed8, transparent);
                    mask-image: radial-gradient(circle at bottom, transparent 40%, black);
                    opacity: 0.6;
                    animation: shimmer 4s linear infinite;
                    pointer-events: none;
                  }

                  .shiny-cta span {
                    position: relative;
                    z-index: 2;
                  }

                  @keyframes shimmer {
                    to {
                      transform: translate(-50%, -50%) rotate(360deg);
                    }
                  }

                  @media (min-width: 640px) {
                    .shiny-cta {
                      padding: 0.875rem 2.5rem;
                      font-size: 1rem;
                    }
                  }
                `}</style>
                <button className="shiny-cta focus:outline-none">
                  <span>Start Free Trial</span>
                </button>
              </Link>
            </div>

            <p className="text-[10px] text-gray-500">No credit card required. 14-day free trial for all plans.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
