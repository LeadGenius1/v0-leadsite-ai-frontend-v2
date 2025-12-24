"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Globe, Target, Sparkles, ArrowRight, ArrowLeft, Check, Loader2, Mail, Users } from "lucide-react"

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
    industry: "", // Now free text instead of dropdown
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
    target_location: "United States",

    // Step 4: Target Audience (updated fields)
    target_company_size: [] as string[],
    target_job_levels: [] as string[],
    services: "",
    unique_selling_points: "",
  })

  const companySizeOptions = [
    "0 - 25",
    "25 - 100",
    "100 - 250",
    "250 - 1000",
    "1K - 10K",
    "10K - 50K",
    "50K - 100K",
    "> 100K",
  ]

  const jobLevelOptions = [
    "C-Level",
    "VP-Level",
    "Director-Level",
    "Manager-Level",
    "Owner",
    "Staff",
    "Entry level",
    "Mid-Senior level",
    "Director",
    "Associate",
  ]

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.business_name.trim() && formData.industry.trim() && formData.website.trim()
    }
    if (currentStep === 2) {
      return formData.owner_name.trim() && formData.email.trim()
    }
    if (currentStep === 3) {
      return formData.target_location.trim()
    }
    if (currentStep === 4) {
      return (
        formData.industry.trim().length >= 3 &&
        formData.target_job_levels.length > 0 &&
        formData.services.trim().length >= 10
      )
    }
    return true
  }

  const handleNext = () => {
    if (!isStepValid()) {
      if (currentStep === 1) {
        setError("Please fill in business name, industry, and website")
      } else if (currentStep === 2) {
        setError("Please fill in owner name and email")
      } else if (currentStep === 3) {
        setError("Please specify your target location")
      } else if (currentStep === 4) {
        setError("Please provide industry keywords, select at least 1 job level, and describe your services")
      }
      return
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      setError(null)
    } else {
      // Step 4: Now submit all data in one POST request
      handleSubmit()
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
      const token = localStorage.getItem("leadsite_token")

      console.log("[v0] Submitting profile data:", formData)
      console.log("[v0] Token:", token ? "exists" : "missing")

      if (!token) {
        console.error("[v0] No token found, redirecting to login")
        router.push("/login")
        return
      }

      const response = await fetch("https://api.leadsite.ai/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Step 1 data
          business_name: formData.business_name,
          industry: formData.industry,
          website: formData.website,

          // Step 2 data
          owner_name: formData.owner_name,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,

          // Step 3 data
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          target_location: formData.target_location,

          // Step 4 data
          target_company_size: formData.target_company_size,
          target_job_levels: formData.target_job_levels,
          services: formData.services,
          unique_selling_points: formData.unique_selling_points,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Profile save error:", errorData)
        throw new Error(errorData.error || "Failed to save profile")
      }

      const successData = await response.json()
      console.log("[v0] Profile saved successfully:", successData)

      setIsAnalyzing(true)
      setTimeout(() => {
        console.log("[v0] Redirecting to dashboard")
        window.location.href = "/dashboard"
      }, 1500)
    } catch (err: any) {
      console.error("[v0] Onboarding submission error:", err)
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
                    <label htmlFor="business_name" className="block text-sm font-medium text-white mb-2">
                      Business Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="business_name"
                      name="business_name"
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => updateField("business_name", e.target.value)}
                      placeholder="Acme Corporation"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-white mb-2">
                      Industry Keywords <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      value={formData.industry}
                      onChange={(e) => updateField("industry", e.target.value)}
                      placeholder="e.g., Technology, SaaS, Healthcare, Real Estate, Construction"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                    <p className="text-neutral-500 text-xs mt-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Enter keywords that describe your industry (used for prospect search)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
                      Website URL <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        id="website"
                        name="website"
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
                    <label htmlFor="owner_name" className="block text-sm font-medium text-white mb-2">
                      Owner Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="owner_name"
                      name="owner_name"
                      type="text"
                      value={formData.owner_name}
                      onChange={(e) => updateField("owner_name", e.target.value)}
                      placeholder="John Smith"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@company.com"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1-555-0123"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                      Business Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
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
                    <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="123 Main St"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="New York"
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-white mb-2">
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
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
                    <label htmlFor="zip" className="block text-sm font-medium text-white mb-2">
                      ZIP Code
                    </label>
                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateField("zip", e.target.value)}
                      placeholder="10001"
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="target_location" className="block text-sm font-medium text-white mb-2">
                      Target Location <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      id="target_location"
                      name="target_location"
                      type="text"
                      value={formData.target_location}
                      onChange={(e) => updateField("target_location", e.target.value)}
                      placeholder="United States"
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
                    <label className="block text-sm font-medium text-white mb-2">Target Company Sizes</label>
                    <div className="grid grid-cols-2 gap-2">
                      {companySizeOptions.map((size) => (
                        <label
                          key={size}
                          htmlFor={`company_size_${size}`}
                          className="flex items-center space-x-2 cursor-pointer group"
                        >
                          <input
                            id={`company_size_${size}`}
                            name="target_company_size"
                            type="checkbox"
                            checked={formData.target_company_size.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField("target_company_size", [...formData.target_company_size, size])
                              } else {
                                updateField(
                                  "target_company_size",
                                  formData.target_company_size.filter((s) => s !== size),
                                )
                              }
                            }}
                            className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
                          />
                          <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                            {size}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-neutral-500 text-xs mt-2">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Select all company sizes you want to target
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Target Job Levels <span className="text-indigo-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {jobLevelOptions.map((level) => (
                        <label
                          key={level}
                          htmlFor={`job_level_${level.replace(/\s+/g, "_")}`}
                          className="flex items-center space-x-2 cursor-pointer group"
                        >
                          <input
                            id={`job_level_${level.replace(/\s+/g, "_")}`}
                            name="target_job_levels"
                            type="checkbox"
                            checked={formData.target_job_levels.includes(level)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField("target_job_levels", [...formData.target_job_levels, level])
                              } else {
                                updateField(
                                  "target_job_levels",
                                  formData.target_job_levels.filter((l) => l !== level),
                                )
                              }
                            }}
                            className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
                          />
                          <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                            {level}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-neutral-500 text-xs mt-2">Select at least 1 job level to target</p>
                  </div>

                  <div>
                    <label htmlFor="services" className="block text-sm font-medium text-white mb-2">
                      Services <span className="text-indigo-400">*</span>
                    </label>
                    <textarea
                      id="services"
                      name="services"
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
                    <label htmlFor="unique_selling_points" className="block text-sm font-medium text-white mb-2">
                      Unique Selling Points
                    </label>
                    <textarea
                      id="unique_selling_points"
                      name="unique_selling_points"
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
