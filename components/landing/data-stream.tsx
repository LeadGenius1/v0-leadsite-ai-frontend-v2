import { Check } from "lucide-react"

export function DataStream() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              Observe your lead pipeline.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Our dashboard provides a comprehensive view of your lead generation engine. Monitor prospect discovery,
              email campaigns, and conversion metrics through a single pane of glass.
            </p>
            <ul className="space-y-3">
              {[
                "Real-time prospect tracking",
                "Automated email campaign analytics",
                "AI-powered sentiment analysis",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative">
            <div className="rounded-xl border border-white/10 bg-[#0a0a0f] overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-500">STATUS: GENERATING LEADS</span>
              </div>

              {/* Chart Area */}
              <div className="p-4 sm:p-6">
                <div className="flex items-end justify-between h-32 sm:h-40 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {[65, 45, 80, 55, 70, 40, 85].map((height, index) => (
                    <div
                      key={index}
                      className={`flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t animate-bar-wave bar-delay-${index + 1}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                {/* Code Snippet */}
                <div className="bg-[#030712] rounded-lg p-3 sm:p-4 font-mono text-xs">
                  <div className="flex justify-between text-gray-500 mb-2">
                    <span className="text-purple-400">const</span>
                    <span>v.2.0.1</span>
                  </div>
                  <div>
                    <span className="text-blue-400">analyzeProspect</span>
                    <span className="text-white">(</span>
                    <span className="text-green-400">business</span>
                    <span className="text-white">);</span>
                  </div>
                  <div className="text-gray-500 mt-1">// Finding qualified leads...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
