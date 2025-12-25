import { Zap, Eye } from "lucide-react"

export function ControlModes() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Choose Your Control Level
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">Run hands-free or review everything before it sends.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 max-w-4xl mx-auto">
          <div className="group p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">Autopilot Mode</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
              Set your criteria once and let LeadSite discover and reach out automatically.
            </p>
          </div>

          <div className="group p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">Review Mode</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
              Preview every prospect and message before sending. You control timing.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
