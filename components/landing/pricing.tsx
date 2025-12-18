"use client"

import type React from "react"

import { Check, Clock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

const FeatureItem = ({
  available,
  text,
}: {
  available: boolean
  text: string
}) => (
  <li className={`flex items-center gap-2 text-xs ${available ? "text-neutral-300" : "text-neutral-500"}`}>
    {available ? (
      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
    ) : (
      <Clock className="w-3 h-3 text-neutral-600 flex-shrink-0" />
    )}
    <span className="flex-1">{text}</span>
  </li>
)

const plans = [
  {
    name: "Starter",
    price: "$59",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      { text: "1 active campaign", available: true },
      { text: "1,000 prospects/month", available: true },
      { text: "AI prospect discovery", available: true },
      { text: "AI-written emails", available: true },
      { text: "Basic analytics dashboard", available: true },
      { text: "Email support", available: true },
      { text: "Custom email domains", available: false },
      { text: "API access", available: false },
    ],
    buttonText: "Start 14-Day Free Trial",
    buttonColor: "indigo",
    accentColor: "indigo",
    popular: false,
  },
  {
    name: "Ramp",
    price: "$159",
    period: "/month",
    description: "For growing businesses that need more",
    features: [
      { text: "5 active campaigns", available: true },
      { text: "5,000 prospects/month", available: true },
      { text: "AI prospect discovery", available: true },
      { text: "AI-written emails", available: true },
      { text: "Advanced analytics & insights", available: true },
      { text: "Priority email support", available: true },
      { text: "Hot lead alerts", available: true },
      { text: "Custom email domains", available: false },
      { text: "API access", available: false },
    ],
    buttonText: "Start 14-Day Free Trial",
    buttonColor: "purple",
    accentColor: "purple",
    popular: true,
  },
  {
    name: "Accelerate",
    price: "$259",
    period: "/month",
    description: "For teams with high-volume needs",
    features: [
      { text: "Unlimited campaigns", available: true },
      { text: "20,000 prospects/month", available: true },
      { text: "Advanced AI discovery", available: true },
      { text: "AI-written emails", available: true },
      { text: "Real-time analytics", available: true },
      { text: "Sentiment analysis", available: true },
      { text: "24/7 priority support", available: true },
      { text: "Hot lead alerts", available: true },
      { text: "Custom email domains", available: true },
      { text: "API access", available: true },
    ],
    buttonText: "Start 14-Day Free Trial",
    buttonColor: "cyan",
    accentColor: "cyan",
    popular: false,
  },
  {
    name: "Custom",
    price: "Custom",
    period: "pricing",
    description: "For enterprises with unique requirements",
    features: [
      { text: "Everything in Accelerate", available: true },
      { text: "White-label solution", available: true },
      { text: "Custom automation workflows", available: true },
      { text: "Dedicated email infrastructure", available: true },
      { text: "Volume discounts", available: true },
      { text: "SLA guarantees", available: true },
      { text: "Custom integrations", available: true },
      { text: "Dedicated success team", available: true },
    ],
    buttonText: "Contact Sales",
    buttonColor: "neutral",
    accentColor: "white",
    popular: false,
    isCustom: true,
  },
]

export function Pricing() {
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [formData, setFormData] = useState({ email: "", password: "", company: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleTrialSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          company_name: formData.company,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error("Email already exists")
        } else if (response.status === 500) {
          throw new Error("Signup failed")
        } else {
          throw new Error(data.error || "Failed to sign up for trial")
        }
      }

      // Store session data
      localStorage.setItem("sessionToken", data.sessionToken)
      if (data.customerId) {
        localStorage.setItem("customerId", data.customerId)
      }

      setSuccess("Trial account created! Redirecting to dashboard...")
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError("Connection failed. Please check your internet and try again.")
      } else {
        setError(err.message || "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const openModal = (planName: string) => {
    setSelectedPlan(planName)
    setShowModal(true)
    setError("")
    setSuccess("")
  }

  const getButtonStyles = (color: string, isCustom?: boolean) => {
    if (isCustom) {
      return "bg-white/10 hover:bg-white/20 text-white border border-white/10"
    }
    switch (color) {
      case "indigo":
        return "bg-indigo-600 hover:bg-indigo-700 text-white"
      case "purple":
        return "bg-purple-600 hover:bg-purple-700 text-white"
      case "cyan":
        return "bg-cyan-600 hover:bg-cyan-700 text-white"
      default:
        return "bg-indigo-600 hover:bg-indigo-700 text-white"
    }
  }

  const getCardHoverColor = (color: string) => {
    switch (color) {
      case "indigo":
        return "hover:border-indigo-500/50"
      case "purple":
        return "hover:border-purple-500/50"
      case "cyan":
        return "hover:border-cyan-500/50"
      default:
        return "hover:border-white/20"
    }
  }

  return (
    <section id="pricing" className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
            Choose the plan that fits your lead generation needs. All plans include a 14-day free trial—no credit card
            required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-4 sm:p-5 border backdrop-blur-sm transition-all duration-500 ${
                plan.popular
                  ? "border-purple-500/50 bg-neutral-900/40 scale-105 lg:scale-110"
                  : "border-white/10 bg-neutral-900/40"
              } ${getCardHoverColor(plan.accentColor)}`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                  <span className="px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-medium rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-3 sm:mb-5">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-neutral-500">{plan.period}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-neutral-400 mt-1.5">{plan.description}</p>
              </div>

              <ul className="space-y-1.5 sm:space-y-2 mb-5">
                {plan.features.map((feature, featureIndex) => (
                  <FeatureItem key={featureIndex} available={feature.available} text={feature.text} />
                ))}
              </ul>

              {plan.isCustom ? (
                <div className="group mt-4 relative">
                  {/* Hover Glow Effect (Behind) */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500 group-hover:duration-200 will-change-transform"></div>

                  {/* Button Element */}
                  <button
                    onClick={() => (window.location.href = "mailto:sales@leadsite.ai")}
                    className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 rounded-full leading-none text-neutral-50 transition-all duration-300 ease-out border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:border-white/20 hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-offset-2 focus:ring-offset-neutral-950 overflow-hidden w-full text-xs sm:text-sm"
                  >
                    {/* Sheen Animation Layer */}
                    <span className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out z-0 pointer-events-none">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 -skew-x-12 transform origin-left"></span>
                    </span>

                    {/* Text */}
                    <span className="relative z-10 font-medium tracking-tight">{plan.buttonText}</span>
                  </button>
                </div>
              ) : (
                <>
                  <style jsx>{`
                    @property --gradient-angle {
                      syntax: "<angle>";
                      initial-value: 0deg;
                      inherits: false;
                    }

                    .shiny-cta-pricing {
                      --gradient-angle: 0deg;
                      position: relative;
                      overflow: hidden;
                      border-radius: 0.5rem;
                      padding: 0.5rem 1rem;
                      font-size: 0.75rem;
                      line-height: 1.2;
                      font-weight: 500;
                      color: #ffffff;
                      background: linear-gradient(#000000, #000000) padding-box,
                        conic-gradient(
                            from var(--gradient-angle),
                            transparent 0%,
                            #1d4ed8 5%,
                            #8484ff 15%,
                            #1d4ed8 30%,
                            transparent 40%
                          )
                          border-box;
                      border: 2px solid transparent;
                      box-shadow: inset 0 0 0 1px #1a1818;
                      cursor: pointer;
                      font-family: "Inter", "Helvetica Neue", sans-serif;
                      animation: border-spin 2.5s linear infinite;
                      width: 100%;
                    }

                    @keyframes border-spin {
                      to {
                        --gradient-angle: 360deg;
                      }
                    }

                    .shiny-cta-pricing::after {
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

                    .shiny-cta-pricing span {
                      position: relative;
                      z-index: 2;
                    }

                    @keyframes shimmer {
                      to {
                        transform: translate(-50%, -50%) rotate(360deg);
                      }
                    }
                  `}</style>
                  <button className="shiny-cta-pricing focus:outline-none" onClick={() => openModal(plan.name)}>
                    <span>{plan.buttonText}</span>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">Start Your 14-Day Free Trial</h3>
            <p className="text-sm text-neutral-400 mb-6">
              Selected plan: <span className="text-white font-semibold">{selectedPlan}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-sm text-green-400">
                {success}
              </div>
            )}

            <form onSubmit={handleTrialSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-neutral-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Company Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 border border-white/10 text-white hover:bg-white/5 bg-transparent px-4 py-2 rounded-lg text-sm"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <style jsx>{`
                  .shiny-cta-modal {
                    --gradient-angle: 0deg;
                    position: relative;
                    overflow: hidden;
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #ffffff;
                    background: linear-gradient(#000000, #000000) padding-box,
                      conic-gradient(
                          from var(--gradient-angle),
                          transparent 0%,
                          #1d4ed8 5%,
                          #8484ff 15%,
                          #1d4ed8 30%,
                          transparent 40%
                        )
                        border-box;
                    border: 2px solid transparent;
                    box-shadow: inset 0 0 0 1px #1a1818;
                    cursor: pointer;
                    animation: border-spin 2.5s linear infinite;
                    flex: 1;
                  }

                  .shiny-cta-modal:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }

                  @keyframes border-spin {
                    to {
                      --gradient-angle: 360deg;
                    }
                  }

                  .shiny-cta-modal::after {
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

                  .shiny-cta-modal span {
                    position: relative;
                    z-index: 2;
                  }

                  @keyframes shimmer {
                    to {
                      transform: translate(-50%, -50%) rotate(360deg);
                    }
                  }
                `}</style>
                <button type="submit" className="shiny-cta-modal" disabled={loading}>
                  <span>{loading ? "Creating Account..." : "Start Free Trial"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
