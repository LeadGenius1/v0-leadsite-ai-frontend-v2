import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "$297",
    description: "Perfect for small businesses getting started with lead generation.",
    features: [
      "20 prospects per day",
      "500 emails per month",
      "Basic AI personalization",
      "Email support",
      "1 campaign",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$597",
    description: "For growing businesses that need more leads and features.",
    features: [
      "50 prospects per day",
      "2,000 emails per month",
      "Advanced AI personalization",
      "Priority support",
      "5 campaigns",
      "Custom email domains",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$997",
    description: "For agencies and large businesses with high-volume needs.",
    features: [
      "Unlimited prospects",
      "Unlimited emails",
      "White-label solution",
      "Dedicated account manager",
      "Unlimited campaigns",
      "API access",
      "Custom integrations",
    ],
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">Choose the plan that fits your business needs.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-4 sm:p-5 border ${
                plan.popular ? "border-purple-500/50 bg-white/5" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {/* Popular Badge */}
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
                  <span className="text-xs text-gray-500">/mo</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 sm:space-y-2 mb-5">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full text-xs ${
                  plan.popular
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
