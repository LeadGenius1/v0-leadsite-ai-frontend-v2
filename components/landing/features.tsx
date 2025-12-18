import { Sparkles, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Prospect Discovery",
    description:
      "Our AI discovers 20-50 qualified prospects daily, perfectly matched to your ideal customer profile. Location-based search with verified contact enrichment.",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
  },
  {
    icon: Zap,
    title: "Automated Outreach",
    description: "Personalized emails written by AI and sent automatically. Replies go directly to your inbox.",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Security",
    description: "Enterprise-grade data isolation. Your prospects and campaigns remain completely private and secure.",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
]

export function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">Core Capabilities</h2>
          <p className="text-xs sm:text-sm text-gray-400">Designed for autonomous lead generation.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${feature.iconBg} flex items-center justify-center mb-3`}
              >
                <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${feature.iconColor}`} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">{feature.title}</h3>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
