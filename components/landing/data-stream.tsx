import { Check } from "lucide-react"

export function DataStream() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-3 sm:space-y-5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              Observe your lead pipeline.
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Our dashboard provides a comprehensive view of your lead generation engine. Monitor prospect discovery,
              email campaigns, and conversion metrics through a single pane of glass.
            </p>
            <ul className="space-y-2">
              {[
                "Real-time prospect tracking",
                "Automated email campaign analytics",
                "AI-powered sentiment analysis",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative">
            <div className="rounded-xl border border-white/10 bg-[#0a0a0f] overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 border-b border-white/10">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] text-gray-500">STATUS: GENERATING LEADS</span>
              </div>

              {/* Chart Area */}
              <div className="p-3 sm:p-5">
                <div className="flex items-end justify-between h-24 sm:h-32 gap-1.5 sm:gap-2 mb-3 sm:mb-5">
                  {[65, 45, 80, 55, 70, 40, 85].map((height, index) => (
                    <div
                      key={index}
                      className={`flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t animate-bar-wave bar-delay-${index + 1}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                {/* Code Snippet */}
                <div className="bg-[#030712] rounded-lg p-2 sm:p-3 font-mono text-[10px] sm:text-xs">
                  <div className="flex justify-between text-gray-500 mb-1.5">
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
