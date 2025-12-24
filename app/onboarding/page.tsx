"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Globe,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Mail,
  Users,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Business Basics
    business_name: "",
    industry: "",
    website: "",

    // Step 2: Owner & Contact
    owner_name: "",
    email: "",
    phone: "",
    description: "",

    // Step 3: Location & Address
    address: "",
    city: "",
    state: "",
    zip: "",
    target_location: "",

    // Step 4: Target Audience
    target_customer_type: "",
    services: "",
    unique_selling_points: "",
  })

  const industries = ["Technology", "SaaS", "E-commerce", "Services", "Manufacturing", "Healthcare", "Finance", "Other"]

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.business_name.trim() && formData.industry && formData.website.trim()
    }
    if (currentStep === 2) {
      return formData.owner_name.trim() && formData.email.trim()
    }
    if (currentStep === 3) {
      return formData.target_location.trim()
    }
    if (currentStep === 4) {
      return formData.target_customer_type.trim().length >= 10 && formData.services.trim().length >= 10
    }
    return true
  }

  const handleNext = async () => {
    if (!isStepValid()) {
      if (currentStep === 1) {
        setError("Please fill in business name, industry, and website")
      } else if (currentStep === 2) {
        setError("Please fill in owner name and email")
      } else if (currentStep === 3) {
        setError("Please specify your target location")
      } else if (currentStep === 4) {
        setError("Please provide at least 10 characters for target customer type and services")
      }
      return
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      setError(null)
    } else {
      await handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("https://api.leadsite.ai/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save profile")
      }

      setIsAnalyzing(true)
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to complete setup. Please try again.")
      setIsLoading(false)
    }
  }

  const steps = [
    { num: 1, label: "Business" },
    { num: 2, label: "Contact" },
    { num: 3, label: "Location" },
    { num: 4, label: "Audience" },
  ]

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-black text-white font-['Inter'] relative overflow-hidden flex items-center justify-center">
        {/* Space Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-30">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 text-center">
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-medium mb-2">AI is analyzing your business</h2>
          <p className="text-neutral-400">Processing your profile and building your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Inter'] relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundSize: "40px 40px",
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full" />
            <span className="text-xl font-medium tracking-wide">LeadSite.AI</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((step, index, array) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      currentStep > step.num
                        ? "bg-indigo-500 text-white"
                        : currentStep === step.num
                          ? "bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400"
                          : "bg-white/5 border border-white/10 text-neutral-500"
                    }`}
                  >
                    {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= step.num ? "text-white" : "text-neutral-500"}`}>
                    {step.label}
                  </span>
                </div>
                {index < array.length - 1 && (
                  <div
                    className={`w-16 h-[2px] mb-6 mx-2 transition-all duration-300 ${
                      currentStep > step.num ? "bg-indigo-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            {/* Step 1: Business Basics */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
                    <Building2 className="w-3 h-3" />
                    STEP 1 OF 4
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">Tell us about your business</h1>
                  <p className="text-neutral-400 text-sm">We'll use this to find your ideal prospects</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Business Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => updateField("business_name", e.target.value)}
                      placeholder="Acme Corporation"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Industry <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.industry}
                        onChange={(e) => updateField("industry", e.target.value)}
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer text-sm"
                      >
                        <option value="" className="bg-neutral-900">
                          Select your industry
                        </option>
                        {industries.map((ind) => (
                          <option key={ind} value={ind} className="bg-neutral-900">
                            {ind}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Website URL <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => updateField("website", e.target.value)}
                        placeholder="https://yourcompany.com"
                        className="w-full bg-black/50 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                      />
                    </div>
                    <p className="text-neutral-500 text-xs mt-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Enter your company website
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Owner & Contact */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
                    <Users className="w-3 h-3" />
                    STEP 2 OF 4
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">Owner & Contact Information</h1>
                  <p className="text-neutral-400 text-sm">Help us personalize your experience</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Owner Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.owner_name}
                      onChange={(e) => updateField("owner_name", e.target.value)}
                      placeholder="John Smith"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@company.com"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1-555-0123"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Business Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Describe what your business does..."
                      rows={4}
                      maxLength={500}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600 resize-none"
                    />
                    <p className="text-neutral-500 text-xs mt-2">{formData.description.length}/500 characters</p>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Location & Address */}
            {currentStep === 3 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-4">
                    <Target className="w-3 h-3" />
                    STEP 3 OF 4
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">Location & Address</h1>
                  <p className="text-neutral-400 text-sm">Where do you operate?</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="123 Main St"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="New York"
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="NY"
                        maxLength={2}
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateField("zip", e.target.value)}
                      placeholder="10001"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Target Location <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.target_location}
                      onChange={(e) => updateField("target_location", e.target.value)}
                      placeholder="e.g., United States, California, New York, North America, Global"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                    <p className="text-neutral-500 text-xs mt-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Where do you sell? This helps us find the right prospects for you
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Target Audience */}
            {currentStep === 4 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
                    <Mail className="w-3 h-3" />
                    STEP 4 OF 4
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">Target Audience</h1>
                  <p className="text-neutral-400 text-sm">Critical for finding the right prospects</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Target Customer Type <span className="text-indigo-400">*</span>
                    </label>
                    <textarea
                      value={formData.target_customer_type}
                      onChange={(e) => updateField("target_customer_type", e.target.value)}
                      placeholder="Describe your ideal customer. Examples: 'Small businesses with 10-50 employees', 'E-commerce companies', 'SaaS founders', 'Marketing agencies'"
                      rows={4}
                      maxLength={500}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600 resize-none"
                    />
                    <p className="text-neutral-500 text-xs mt-2">
                      {formData.target_customer_type.length}/500 characters (minimum 10)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Services <span className="text-indigo-400">*</span>
                    </label>
                    <textarea
                      value={formData.services}
                      onChange={(e) => updateField("services", e.target.value)}
                      placeholder="What services/products do you offer? This helps us find the right prospects."
                      rows={4}
                      maxLength={1000}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600 resize-none"
                    />
                    <p className="text-neutral-500 text-xs mt-2">
                      {formData.services.length}/1000 characters (minimum 10)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Unique Selling Points</label>
                    <textarea
                      value={formData.unique_selling_points}
                      onChange={(e) => updateField("unique_selling_points", e.target.value)}
                      placeholder="What makes you unique? Why should prospects choose you over competitors?"
                      rows={4}
                      maxLength={2000}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600 resize-none"
                    />
                    <p className="text-neutral-500 text-xs mt-2">
                      {formData.unique_selling_points.length}/2000 characters
                    </p>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={isLoading || !isStepValid()}
                type="button"
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium transition-all disabled:cursor-not-allowed text-sm"
              >
                {currentStep === 4 ? (
                  isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Sparkles className="w-4 h-4" />
                    </>
                  )
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-neutral-500 text-sm mt-6">
            Need help?{" "}
            <a href="mailto:support@leadsite.ai" className="text-indigo-400 hover:text-indigo-300">
              Contact support
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
