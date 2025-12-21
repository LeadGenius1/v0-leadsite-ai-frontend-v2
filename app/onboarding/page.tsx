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
  Briefcase,
  Mail,
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
    website_url: "",
    business_name: "",
    industry: "",
    company_size: "",
    year_founded: "",

    // Step 2: Target Customer
    target_customer_type: "",
    target_industries: [] as string[],
    target_company_sizes: [] as string[],
    target_job_titles: [] as string[],
    target_locations: [] as string[],
    custom_job_titles: "",

    // Step 3: Value Proposition
    services_offered: "",
    unique_selling_points: "",
    customer_pain_points: "",

    // Step 4: Outreach Preferences
    email_tone: "professional",
    email_style: "concise",
    include_case_studies: false,
    include_pricing: false,
  })

  const industries = [
    "Technology / SaaS",
    "Marketing / Advertising",
    "Financial Services",
    "Healthcare",
    "E-commerce / Retail",
    "Manufacturing",
    "Real Estate",
    "Professional Services",
    "Education",
    "Hospitality / Travel",
    "Construction",
    "Logistics / Transportation",
    "Media / Entertainment",
    "Nonprofit",
    "Other",
  ]

  const companySizes = ["1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "500+ employees"]

  const commonJobTitles = [
    "CEO / Founder",
    "CTO / Technical Lead",
    "CMO / Marketing Director",
    "CFO / Finance Director",
    "VP of Sales",
    "VP of Operations",
    "HR Director",
    "Procurement Manager",
    "IT Manager",
    "Business Owner",
  ]

  const regions = [
    "United States",
    "Canada",
    "United Kingdom",
    "Europe",
    "Australia",
    "Asia Pacific",
    "Latin America",
    "Global",
  ]

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const toggleSelection = (field: string, item: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[]
    const newArray = currentArray.includes(item) ? currentArray.filter((i) => i !== item) : [...currentArray, item]
    updateField(field, newArray)
  }

  const validateUrl = (url: string) => {
    let validUrl = url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      validUrl = "https://" + url
    }
    try {
      new URL(validUrl)
      return { valid: true, url: validUrl }
    } catch {
      return { valid: false, url }
    }
  }

  const validateStep = (step: number): boolean => {
    setError(null)

    if (step === 1) {
      const { valid } = validateUrl(formData.website_url)
      if (!valid) {
        setError("Please enter a valid website URL")
        return false
      }
      if (!formData.business_name || !formData.industry) {
        setError("Please complete all required fields")
        return false
      }
    }

    if (step === 2) {
      if (!formData.target_customer_type) {
        setError("Please select your customer type")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        handleSubmit()
      } else {
        setCurrentStep((prev) => prev + 1)
      }
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    setError(null)
  }

  const handleSubmit = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      const { url } = validateUrl(formData.website_url)

      const payload = {
        website_url: url,
        business_name: formData.business_name,
        industry: formData.industry,
        company_size: formData.company_size || "1-10 employees",
        target_industries: formData.target_industries,
        target_company_sizes: formData.target_company_sizes,
        target_job_titles: [...formData.target_job_titles, formData.custom_job_titles].filter(Boolean),
        target_locations: formData.target_locations,
        unique_selling_points: formData.unique_selling_points,
        email_tone: formData.email_tone,
        email_length: formData.email_style,
        include_case_studies: formData.include_case_studies,
        include_pricing: formData.include_pricing,
      }

      const response = await fetch("https://api.leadsite.ai/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = `Failed to save profile (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          const errorText = await response.text()
          if (errorText) errorMessage = errorText
        }
        throw new Error(errorMessage)
      }

      await response.json()

      await new Promise((resolve) => setTimeout(resolve, 3000))

      window.location.href = "/dashboard"
    } catch (err) {
      let userMessage = "Failed to save profile"
      if (err instanceof Error) {
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          userMessage = "Your session has expired. Please log in again."
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else if (err.message.includes("Network") || err.message === "Failed to fetch") {
          userMessage = "Cannot connect to server. Please check your internet connection and try again."
        } else {
          userMessage = err.message
        }
      }

      setError(userMessage)
      setIsAnalyzing(false)
    }
  }

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
          <p className="text-neutral-400">Processing your website and building your profile...</p>
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
            {[
              { num: 1, label: "Business" },
              { num: 2, label: "Audience" },
              { num: 3, label: "Value Prop" },
              { num: 4, label: "Preferences" },
            ].map((step, index, array) => (
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
                      Website URL <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        type="text"
                        value={formData.website_url}
                        onChange={(e) => updateField("website_url", e.target.value)}
                        placeholder="yourcompany.com"
                        className="w-full bg-black/50 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                      />
                    </div>
                    <p className="text-neutral-500 text-xs mt-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      AI will analyze your website to understand your business
                    </p>
                  </div>

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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Company Size</label>
                      <select
                        value={formData.company_size}
                        onChange={(e) => updateField("company_size", e.target.value)}
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer text-sm"
                      >
                        <option value="" className="bg-neutral-900">
                          Select size
                        </option>
                        {companySizes.map((size) => (
                          <option key={size} value={size} className="bg-neutral-900">
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Year Founded</label>
                      <input
                        type="number"
                        value={formData.year_founded}
                        onChange={(e) => updateField("year_founded", e.target.value)}
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Target Customer */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
                    <Target className="w-3 h-3" />
                    STEP 2 OF 4
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">Who is your ideal customer?</h1>
                  <p className="text-neutral-400 text-sm">Help us find the perfect prospects for your business</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      What type of customers do you serve? <span className="text-indigo-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "B2B", label: "B2B", desc: "Sell to businesses" },
                        { value: "B2C", label: "B2C", desc: "Sell to consumers" },
                        { value: "Both", label: "Both", desc: "Sell to both" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateField("target_customer_type", type.value)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            formData.target_customer_type === type.value
                              ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                              : "bg-black/30 border-white/10 text-neutral-400 hover:border-white/20"
                          }`}
                        >
                          <p className="font-medium text-white">{type.label}</p>
                          <p className="text-xs mt-1 text-neutral-400">{type.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Target Industries <span className="text-neutral-500">(Select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {industries.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => toggleSelection("target_industries", ind)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            formData.target_industries.includes(ind)
                              ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300"
                              : "bg-black/30 border border-white/10 text-neutral-400 hover:border-white/20"
                          }`}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Target Job Titles</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {commonJobTitles.slice(0, 6).map((title) => (
                        <button
                          key={title}
                          type="button"
                          onClick={() => toggleSelection("target_job_titles", title)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            formData.target_job_titles.includes(title)
                              ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300"
                              : "bg-black/30 border border-white/10 text-neutral-400 hover:border-white/20"
                          }`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={formData.custom_job_titles}
                      onChange={(e) => updateField("custom_job_titles", e.target.value)}
                      placeholder="Or enter custom titles (comma-separated)"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Target Locations</label>
                    <div className="flex flex-wrap gap-2">
                      {regions.map((region) => (
                        <button
                          key={region}
                          type="button"
                          onClick={() => toggleSelection("target_locations", region)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            formData.target_locations.includes(region)
                              ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300"
                              : "bg-black/30 border border-white/10 text-neutral-400 hover:border-white/20"
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Value Proposition */}
            {currentStep === 3 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-4">
                    <Briefcase className="w-3 h-3" />
                    STEP 3 OF 4
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">What value do you provide?</h1>
                  <p className="text-neutral-400 text-sm">Help us craft compelling outreach messages</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      What services or products do you offer?
                    </label>
                    <textarea
                      value={formData.services_offered}
                      onChange={(e) => updateField("services_offered", e.target.value)}
                      placeholder="E.g., We provide cloud-based accounting software for small businesses..."
                      rows={3}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">What makes you unique?</label>
                    <textarea
                      value={formData.unique_selling_points}
                      onChange={(e) => updateField("unique_selling_points", e.target.value)}
                      placeholder="E.g., 10x faster setup, AI-powered insights, 24/7 support..."
                      rows={3}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      What problems do you solve for customers?
                    </label>
                    <textarea
                      value={formData.customer_pain_points}
                      onChange={(e) => updateField("customer_pain_points", e.target.value)}
                      placeholder="E.g., Eliminates manual data entry, reduces accounting errors, saves 10 hours per week..."
                      rows={3}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600 resize-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Outreach Preferences */}
            {currentStep === 4 && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
                    <Mail className="w-3 h-3" />
                    STEP 4 OF 4
                  </div>
                  <h1 className="text-2xl font-medium text-white mb-2">Outreach preferences</h1>
                  <p className="text-neutral-400 text-sm">Customize how AI writes your emails</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Email Tone</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "professional", label: "Professional", desc: "Formal & polished" },
                        { value: "friendly", label: "Friendly", desc: "Warm & conversational" },
                        { value: "direct", label: "Direct", desc: "Brief & to the point" },
                      ].map((tone) => (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() => updateField("email_tone", tone.value)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            formData.email_tone === tone.value
                              ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                              : "bg-black/30 border-white/10 text-neutral-400 hover:border-white/20"
                          }`}
                        >
                          <p className="font-medium text-white text-sm">{tone.label}</p>
                          <p className="text-xs mt-1 text-neutral-400">{tone.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Email Length</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "concise", label: "Concise", desc: "2-3 short paragraphs" },
                        { value: "detailed", label: "Detailed", desc: "4-5 comprehensive paragraphs" },
                      ].map((style) => (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() => updateField("email_style", style.value)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            formData.email_style === style.value
                              ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                              : "bg-black/30 border-white/10 text-neutral-400 hover:border-white/20"
                          }`}
                        >
                          <p className="font-medium text-white text-sm">{style.label}</p>
                          <p className="text-xs mt-1 text-neutral-400">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Include in emails</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.include_case_studies}
                          onChange={(e) => updateField("include_case_studies", e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/20"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">Case studies & success stories</p>
                          <p className="text-neutral-400 text-xs">
                            Share examples of how you've helped similar companies
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.include_pricing}
                          onChange={(e) => updateField("include_pricing", e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/20"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">Pricing information</p>
                          <p className="text-neutral-400 text-xs">
                            Include transparent pricing or offer to discuss costs
                          </p>
                        </div>
                      </label>
                    </div>
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
                disabled={isLoading}
                type="button"
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium transition-all disabled:cursor-not-allowed text-sm"
              >
                {currentStep === 4 ? (
                  isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
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
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
