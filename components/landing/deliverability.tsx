import { Shield, TrendingUp, CheckCircle } from "lucide-react"

export function Deliverability() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Deliverability Protection
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">Your sender reputation stays protected.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          <div className="group p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">Smart Sending Limits</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
              Built-in throttling and warm-up logic protect your domain reputation automatically.
            </p>
          </div>

          <div className="group p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">Compliance Built-In</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
              Automatic unsubscribe handling and CAN-SPAM compliance out of the box.
            </p>
          </div>

          <div className="group p-4 sm:p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">Gradual Sending</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
              Emails sent gradually over time to maximize inbox placement and replies.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
