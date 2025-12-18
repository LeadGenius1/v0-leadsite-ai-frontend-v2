export function HowItWorks() {
  return (
    <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
      <h2 className="text-center text-2xl font-medium tracking-tight mb-16 text-white">The Integration Process</h2>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-[15px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent md:left-1/2 md:-ml-[1px]" />

        <div className="space-y-12">
          {/* Step 1 - Enter Website */}
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
            <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
              <h3 className="text-lg font-medium text-white">Enter Your Website</h3>
              <p className="text-sm text-neutral-500 mt-2 font-light">
                Simply paste your website URL during signup. No code installation, no technical setup. Works with any
                website instantly.
              </p>
            </div>
            <div className="absolute left-0 md:static md:w-8 md:h-8 flex items-center justify-center order-1 md:order-2">
              <div className="w-8 h-8 rounded-full bg-black border border-indigo-500/50 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <div className="w-2 h-2 bg-indigo-400 rounded-full" />
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12 order-3" />
          </div>

          {/* Step 2 - AI Analysis */}
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
            <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1" />
            <div className="absolute left-0 md:static md:w-8 md:h-8 flex items-center justify-center order-1 md:order-2">
              <div className="w-8 h-8 rounded-full bg-black border border-white/10 group-hover:border-purple-500/50 transition-colors flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-neutral-600 group-hover:bg-purple-400 transition-colors rounded-full" />
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12 order-3 md:order-3">
              <h3 className="text-lg font-medium text-white">AI Analyzes Your Business</h3>
              <p className="text-sm text-neutral-500 mt-2 font-light">
                Our AI scans your website in minutes to understand your products, services, and builds your ideal
                customer profile automatically.
              </p>
            </div>
          </div>

          {/* Step 3 - Generate Leads */}
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
            <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
              <h3 className="text-lg font-medium text-white">Prospects Delivered Daily</h3>
              <p className="text-sm text-neutral-500 mt-2 font-light">
                Watch as qualified prospects appear in your dashboard. AI writes personalized emails and sends them
                automatically. Replies land in your inbox.
              </p>
            </div>
            <div className="absolute left-0 md:static md:w-8 md:h-8 flex items-center justify-center order-1 md:order-2">
              <div className="w-8 h-8 rounded-full bg-black border border-white/10 group-hover:border-cyan-500/50 transition-colors flex items-center justify-center z-10">
                <div className="w-2 h-2 bg-neutral-600 group-hover:bg-cyan-400 transition-colors rounded-full" />
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12 order-3" />
          </div>
        </div>
      </div>
    </section>
  )
}
