"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Upload } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

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
  const [error, setError] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Step 1: Profile
    ownerName: "",
    jobTitle: "",
    logoFile: null as File | null,

    // Step 2: Business Address
    businessName: "",
    street: "",
    city: "",
    state: "",
    zip: "",

    // Step 3: Contact & Social
    email: "",
    phone: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",

    // Additional fields for backend
    industry: "Technology",
    website: "",
  })

  const updateField = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField("logoFile", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep = (step: number): boolean => {
    setError(null)

    if (step === 1) {
      if (!formData.ownerName.trim() || !formData.jobTitle.trim()) {
        setError("Please complete all required fields")
        return false
      }
    }

    if (step === 2) {
      if (
        !formData.businessName.trim() ||
        !formData.street.trim() ||
        !formData.city.trim() ||
        !formData.state ||
        !formData.zip.trim()
      ) {
        setError("Please complete all required fields")
        return false
      }
    }

    if (step === 3) {
      if (!formData.email.trim() || !formData.phone.trim()) {
        setError("Email and phone are required")
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
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
    setError(null)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        router.push("/login")
        return
      }

      let logoBase64 = null
      if (formData.logoFile) {
        const reader = new FileReader()
        logoBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(formData.logoFile!)
        })
      }

      const payload = {
        business_name: formData.businessName,
        industry: formData.industry,
        website: formData.website || `https://${formData.businessName.toLowerCase().replace(/\s+/g, "")}.com`,
        owner_name: formData.ownerName,
        job_title: formData.jobTitle,
        logo: logoBase64, // Include logo in payload
        email: formData.email,
        phone: formData.phone,
        address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        linkedin_url: formData.linkedinUrl,
        twitter_url: formData.twitterUrl,
        github_url: formData.githubUrl,
        target_customer_type: "",
        target_location: `${formData.city}, ${formData.state}`,
        services: "",
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
    { number: 2, label: "Address" },
    { number: 3, label: "Contact" },
    { number: 4, label: "Finish" },
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <div className="px-6 py-4 bg-[#171717] space-y-4">
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => updateField("jobTitle", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CEO, Developer, Designer..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Business Logo</label>
                  <div className="flex items-center space-x-4">
                    {logoPreview ? (
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#333333]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#232323] border-2 border-[#333333] flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-400 hover:bg-[#2a2a2a] text-center">
                        {formData.logoFile ? formData.logoFile.name : "Choose file"}
                      </div>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload your company logo or profile picture</p>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Business Name *</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="San Francisco"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      {STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => updateField("zip", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="94102"
                    maxLength={5}
                    required
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Business Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div className="pt-2 border-t border-[#232323]">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Social Media Links (Optional)</p>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => updateField("linkedinUrl", e.target.value)}
                      className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="LinkedIn URL"
                    />
                    <input
                      type="url"
                      value={formData.twitterUrl}
                      onChange={(e) => updateField("twitterUrl", e.target.value)}
                      className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Twitter/X URL"
                    />
                    <input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => updateField("githubUrl", e.target.value)}
                      className="w-full bg-[#232323] border border-[#333333] rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="GitHub URL"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">Review Your Information</h3>
                  <p className="text-sm text-gray-400">Please verify your details before completing setup</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3 border border-[#232323]">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Profile</p>
                    <p className="text-gray-300 text-sm">
                      {formData.ownerName} - {formData.jobTitle}
                    </p>
                  </div>

                  <div className="border-t border-[#232323] pt-3">
                    <p className="text-xs text-gray-500 uppercase">Business</p>
                    <p className="text-gray-300 text-sm">{formData.businessName}</p>
                    <p className="text-gray-400 text-xs">
                      {formData.street}, {formData.city}, {formData.state} {formData.zip}
                    </p>
                  </div>

                  <div className="border-t border-[#232323] pt-3">
                    <p className="text-xs text-gray-500 uppercase">Contact</p>
                    <p className="text-gray-300 text-sm">{formData.email}</p>
                    <p className="text-gray-400 text-xs">{formData.phone}</p>
                  </div>

                  {(formData.linkedinUrl || formData.twitterUrl || formData.githubUrl) && (
                    <div className="border-t border-[#232323] pt-3">
                      <p className="text-xs text-gray-500 uppercase mb-1">Social Links</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.linkedinUrl && <span className="text-xs text-blue-400">LinkedIn</span>}
                        {formData.twitterUrl && <span className="text-xs text-blue-400">Twitter</span>}
                        {formData.githubUrl && <span className="text-xs text-blue-400">GitHub</span>}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By completing setup, you agree to receive AI-powered lead generation insights
                </p>
              </div>
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
                {isLoading ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
