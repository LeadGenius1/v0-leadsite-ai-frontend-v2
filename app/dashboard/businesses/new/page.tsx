"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Building2, Target, FileText, LogOut } from "lucide-react"

const API_URL = "https://api.leadsite.ai"

const INDUSTRIES = [
  "Marketing",
  "Software",
  "Consulting",
  "Finance",
  "Healthcare",
  "Real Estate",
  "E-commerce",
  "Manufacturing",
  "Construction",
  "Education",
  "Hospitality",
  "Other",
]

export default function NewBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    target_location: "",
    target_business_type: "",
    description: "",
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/businesses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to add business")
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Failed to add business:", err)
      setError(err instanceof Error ? err.message : "Failed to add business")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px] animate-float"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          mask: "radial-gradient(circle at center, black, transparent 80%)",
        }}
      ></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"></div>
              <span className="font-bold text-lg">LEADSITE</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm text-red-400 hover:text-red-300 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <span>/</span>
            <span>Add Business</span>
          </div>

          {/* Badge */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping absolute"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full relative"></div>
            </div>
            <span className="text-xs text-indigo-400 font-medium">AI-POWERED LEAD GENERATION</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Business</h1>
            <p className="text-gray-400">Tell us about your business and target prospects</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">{error}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-neutral-900/30 border border-white/10 rounded-2xl p-8 space-y-8">
            {/* Section 1 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400">
                  1
                </div>
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Your Business Details</span>
                </h2>
              </div>

              <div className="space-y-4 pl-11">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Our AI will analyze this</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Industry <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-400">
                  2
                </div>
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Target Prospects</span>
                </h2>
              </div>

              <div className="space-y-4 pl-11">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.target_location}
                    onChange={(e) => setFormData({ ...formData, target_location: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Business Type <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.target_business_type}
                    onChange={(e) => setFormData({ ...formData, target_business_type: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                    placeholder="Restaurants, Dental offices..."
                  />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-400">
                  3
                </div>
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Additional Context (Optional)</span>
                </h2>
              </div>

              <div className="pl-11">
                <label className="block text-sm font-medium mb-2">Description & Notes</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
                  placeholder="Any additional details about your business or target audience..."
                />
              </div>
            </div>

            {/* Info box */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6">
              <h3 className="font-semibold mb-2 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span>What happens next?</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>Our AI analyzes your website and business context</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>We find qualified prospects matching your target criteria</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>Personalized emails are automatically generated and sent</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Start Lead Generation</span>
                  </>
                )}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-medium hover:bg-white/10 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 text-center text-sm text-gray-400">
        <p>&copy; 2025 LeadSite.AI. All rights reserved.</p>
      </footer>
    </div>
  )
}
