"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Building2, MapPin, Target, CheckCircle2, Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Education",
  "Construction",
  "Professional Services",
  "Marketing & Advertising",
  "Food & Beverage",
  "Other",
]

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form data
  const [formData, setFormData] = useState({
    // Section 1: Business Information
    businessName: "",
    industry: "",
    website: "",
    description: "",

    // Section 2: Contact Information
    ownerName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",

    // Section 3: Outreach Targeting
    targetCustomerType: "",
    targetLocation: "",
    services: "",
    uniqueSellingPoints: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    setError("")

    if (step === 1) {
      if (!formData.businessName.trim()) {
        setError("Business name is required")
        return false
      }
      if (!formData.industry) {
        setError("Please select an industry")
        return false
      }
      if (!formData.website.trim()) {
        setError("Website URL is required")
        return false
      }
      // Basic URL validation
      const urlPattern = /^https?:\/\/.+\..+/
      if (!urlPattern.test(formData.website)) {
        setError("Please enter a valid website URL (e.g., https://example.com)")
        return false
      }
    }

    if (step === 2) {
      if (!formData.ownerName.trim()) {
        setError("Owner/Contact name is required")
        return false
      }
      if (!formData.email.trim()) {
        setError("Business email is required")
        return false
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(formData.email)) {
        setError("Please enter a valid email address")
        return false
      }
      if (!formData.phone.trim()) {
        setError("Phone number is required")
        return false
      }
      if (!formData.street.trim() || !formData.city.trim() || !formData.state || !formData.zip.trim()) {
        setError("Complete address is required")
        return false
      }
    }

    if (step === 3) {
      if (!formData.targetCustomerType.trim()) {
        setError("Target customer type is required")
        return false
      }
      if (!formData.targetLocation.trim()) {
        setError("Target location is required")
        return false
      }
      if (!formData.services.trim()) {
        setError("Services offered is required")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setError("")
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateStep(3)) return

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      console.log("[v0] === PROFILE SUBMISSION START ===")
      console.log("[v0] Token exists:", !!token)

      if (!token) {
        console.log("[v0] ERROR: No authentication token found")
        router.push("/login")
        return
      }

      const payload = {
        business_name: formData.businessName,
        industry: formData.industry,
        website: formData.website,
        description: formData.description || null,
        owner_name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        target_customer_type: formData.targetCustomerType,
        target_location: formData.targetLocation,
        services: formData.services,
        unique_selling_points: formData.uniqueSellingPoints || null,
      }

      console.log("[v0] Payload being sent to backend:", JSON.stringify(payload, null, 2))
      console.log("[v0] API Endpoint:", `${API_BASE_URL}/api/profile`)
      console.log("[v0] Authorization: Bearer [TOKEN]")

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      const data = await response.json()
      console.log("[v0] Response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("[v0] API ERROR:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error || data.message,
        })
        throw new Error(data.error || data.message || `Server responded with status ${response.status}`)
      }

      if (!data.success) {
        console.error("[v0] Business logic error:", data.error)
        throw new Error(data.error || "Failed to save profile")
      }

      console.log("[v0] ✓ Profile saved successfully")
      console.log("[v0] ✓ N8N should now be processing this data")
      console.log("[v0] Token still valid:", !!localStorage.getItem("token"))
      console.log("[v0] === PROFILE SUBMISSION END ===")

      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] SUBMISSION FAILED:", err)
      console.error("[v0] Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      })
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            <span className="text-2xl font-bold text-white">LeadSite.AI</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Complete Your Profile</h1>
          <p className="text-gray-400">Tell us about your business to get started with AI-powered lead generation</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 transition ${
                      currentStep > step ? "bg-gradient-to-r from-indigo-600 to-blue-600" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between max-w-md mx-auto mt-3 text-xs text-gray-400">
            <span className={currentStep === 1 ? "text-indigo-400 font-medium" : ""}>Business Info</span>
            <span className={currentStep === 2 ? "text-indigo-400 font-medium" : ""}>Contact Details</span>
            <span className={currentStep === 3 ? "text-indigo-400 font-medium" : ""}>Targeting</span>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-md bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Business Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry} className="bg-neutral-900">
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Description <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
                    placeholder="Brief description of your business..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Contact Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Owner/Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="John Smith"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Street Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      placeholder="San Francisco"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    >
                      <option value="">State</option>
                      {STATES.map((state) => (
                        <option key={state} value={state} className="bg-neutral-900">
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ZIP Code <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateField("zip", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      placeholder="94102"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Outreach Targeting */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Outreach Targeting</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Customer Type <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetCustomerType}
                    onChange={(e) => updateField("targetCustomerType", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="e.g., Restaurants, Dental Offices, Retail Stores"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Who are your ideal customers? Be specific about the type of business you want to reach.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetLocation}
                    onChange={(e) => updateField("targetLocation", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    placeholder="e.g., San Francisco, CA or United States"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Where are your target customers located? Can be a city, state, or country.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Services Offered <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.services}
                    onChange={(e) => updateField("services", e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
                    placeholder="Describe what services or products you offer..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unique Selling Points <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.uniqueSellingPoints}
                    onChange={(e) => updateField("uniqueSellingPoints", e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
                    placeholder="What makes your business stand out from competitors?"
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                className="px-6 py-3 text-gray-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
