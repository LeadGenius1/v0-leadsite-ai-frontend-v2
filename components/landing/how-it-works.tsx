const steps = [
  {
    title: "Install Widget",
    description: "Add one line of code to your website. Works with WordPress, Shopify, Wix, or any platform.",
    position: "left",
  },
  {
    title: "AI Analysis",
    description: "Our AI analyzes your business and builds your ideal customer profile in minutes.",
    position: "right",
  },
  {
    title: "Generate Leads",
    description: "Sit back and watch as qualified prospects appear in your dashboard daily, with automated outreach.",
    position: "left",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#030712]">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">The Integration Process</h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/30 to-transparent transform -translate-x-1/2 hidden sm:block" />

          {/* Steps */}
          <div className="space-y-10 sm:space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Dot */}
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 hidden sm:block">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-dot-pulse" />
                </div>

                {/* Content */}
                <div
                  className={`sm:w-5/12 ${step.position === "right" ? "sm:ml-auto sm:pl-6" : "sm:mr-auto sm:pr-6 sm:text-right"}`}
                >
                  <div className="flex items-start gap-2 sm:block">
                    {/* Mobile dot */}
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 sm:hidden" />
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">{step.title}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
