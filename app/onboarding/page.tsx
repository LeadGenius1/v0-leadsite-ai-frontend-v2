"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"

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

  const [formData, setFormData] = useState({
    ownerName: "",
    jobTitle: "",
    businessName: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    targetCustomerType: "",
    targetLocation: "",
    services: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    setError("")

    if (step === 1) {
      if (!formData.ownerName.trim() || !formData.jobTitle.trim()) {
        setError("Please complete all required fields")
        return false
      }
    }

    if (step === 2) {
      if (!formData.businessName.trim() || !formData.industry || !formData.website.trim()) {
        setError("Please complete all required fields")
        return false
      }
    }

    if (step === 3) {
      if (!formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.state) {
        setError("Please complete all required fields")
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
    setCurrentStep((prev) => prev - 1)
    setError("")
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const payload = {
        business_name: formData.businessName,
        industry: formData.industry,
        website: formData.website,
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
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save profile")
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, label: "Profile" },
    { number: 2, label: "Business" },
    { number: 3, label: "Contact" },
    { number: 4, label: "Goals" },
  ]

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#151515] rounded-xl overflow-hidden shadow-2xl border border-[#232323]">
        <div className="px-6 pt-6 pb-4 border-b border-[#232323]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-gray-200 font-medium text-sm">Getting Started</h2>
            </div>
            <span className="text-xs text-gray-500">Step {currentStep} of 4</span>
          </div>
        </div>

        {/* Welcome Message (only on step 1) */}
        {currentStep === 1 && (
          <div className="px-6 py-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-blue-500/10 p-3 rounded-full mb-4">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">Welcome to the platform!</h1>
              <p className="text-gray-400 text-sm">
                Let's get you set up in just a few simple steps. It'll only take a minute.
              </p>
            </div>

            <div className="flex justify-between items-center mb-8 px-2">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.number === currentStep
                          ? "bg-blue-500 text-white"
                          : step.number < currentStep
                            ? "bg-blue-500/50 text-white"
                            : "bg-[#232323] text-gray-400"
                      }`}
                    >
                      {step.number}
                    </div>
                    <p className={`text-xs mt-1 ${step.number === currentStep ? "text-blue-400" : "text-gray-500"}`}>
                      {step.label}
                    </p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="h-[2px] flex-grow bg-[#232323] mx-1">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: step.number < currentStep ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 bg-[#171717] space-y-4">
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => updateField("jobTitle", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 2: Business */}
            {currentStep === 2 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Business Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">State</option>
                      {STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => updateField("zip", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={5}
                  />
                </div>
              </>
            )}

            {/* Step 4: Goals */}
            {currentStep === 4 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Target Customer Type
                  </label>
                  <input
                    type="text"
                    value={formData.targetCustomerType}
                    onChange={(e) => updateField("targetCustomerType", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Small business owners"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Target Location</label>
                  <input
                    type="text"
                    value={formData.targetLocation}
                    onChange={(e) => updateField("targetLocation", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., United States"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Services Offered</label>
                  <textarea
                    value={formData.services}
                    onChange={(e) => updateField("services", e.target.value)}
                    rows={3}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Describe your main services..."
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md p-2">{error}</div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-[#232323] flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-[#333333] text-gray-300 text-sm rounded-md hover:bg-[#1a1a1a]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Complete"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
