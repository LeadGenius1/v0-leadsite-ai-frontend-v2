import { Sparkles, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Prospect Discovery",
    description:
      "Our AI finds 20-50 qualified prospects daily using Google Maps and Apollo.io, perfectly matched to your business.",
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
    <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Core Capabilities</h2>
          <p className="text-sm sm:text-base text-gray-400">Designed for autonomous lead generation.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-5 sm:p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${feature.iconBg} flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
