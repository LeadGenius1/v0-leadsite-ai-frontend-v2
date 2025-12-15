"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Target,
  Mail,
  Plus,
  LogOut,
  Sparkles,
  Zap,
  Search,
  Eye,
  Play,
  Clock,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react"
import { api } from "@/lib/api"

interface UserData {
  customerId: string
  email: string
  plan_tier: string
  trial_ends_at: string
  created_at: string
}

interface Business {
  id: string
  customer_id: string
  name: string
  industry: string
  url: string
  analysis_status: string
  created_at: string
}

interface Campaign {
  id: string
  business_id: string
  name: string
  status: string
  created_at: string
}

interface Prospect {
  id: number
  customer_id: string
  business_id: string
  company_name: string
  contact_name: string
  contact_email: string
  industry: string
  status: string
  source: string
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Education",
  "Construction",
  "Other",
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)

  // Modal states
  const [showCreateBusiness, setShowCreateBusiness] = useState(false)
  const [showProspects, setShowProspects] = useState(false)
  const [workflowStatus, setWorkflowStatus] = useState<{
    type: string
    status: "pending" | "running" | "complete" | "error"
    message: string
  } | null>(null)

  // Form states
  const [businessForm, setBusinessForm] = useState({ name: "", industry: "", url: "" })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("sessionToken")
    if (!token) {
      router.push("/signup")
      return
    }

    async function loadDashboard() {
      try {
        setLoading(true)
        const userData = await api.getUserDashboard(token)
        setUser(userData)
        localStorage.setItem("customerId", userData.customerId)

        // Calculate trial days left
        const trialEnd = new Date(userData.trial_ends_at)
        const today = new Date()
        const daysLeft = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        setTrialDaysLeft(Math.max(0, daysLeft))

        // Load businesses and campaigns
        const [businessesData, campaignsData] = await Promise.all([
          api.getBusinesses(userData.customerId, token),
          api.getCampaignsByCustomer(userData.customerId, token),
        ])

        setBusinesses(businessesData.businesses || [])
        setCampaigns(campaignsData.campaigns || [])
        setError(null)
      } catch (err: any) {
        console.error("[v0] Dashboard load failed:", err)
        if (err.message?.includes("401")) {
          localStorage.removeItem("sessionToken")
          localStorage.removeItem("customerId")
          router.push("/signup")
        } else {
          setError("Failed to load dashboard data")
        }
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const handleCreateBusiness = async () => {
    const token = localStorage.getItem("sessionToken")
    const customerId = localStorage.getItem("customerId")
    if (!token || !customerId) return

    if (!businessForm.name || !businessForm.industry || !businessForm.url) {
      setError("All fields are required")
      return
    }

    try {
      setFormLoading(true)
      const result = await api.createBusiness(
        {
          customer_id: customerId,
          name: businessForm.name,
          industry: businessForm.industry,
          url: businessForm.url,
        },
        token,
      )

      // Refresh businesses
      const businessesData = await api.getBusinesses(customerId, token)
      setBusinesses(businessesData.businesses || [])

      setShowCreateBusiness(false)
      setBusinessForm({ name: "", industry: "", url: "" })
      setError(null)
    } catch (err) {
      console.error("[v0] Create business failed:", err)
      setError("Failed to create business")
    } finally {
      setFormLoading(false)
    }
  }

  const handleTriggerWorkflow = async (workflowType: "analyze_business" | "discover_prospects" | "generate_emails") => {
    const token = localStorage.getItem("sessionToken")
    const customerId = localStorage.getItem("customerId")
    if (!token || !customerId || !selectedBusinessId) return

    try {
      setWorkflowStatus({ type: workflowType, status: "running", message: "Workflow running..." })

      await api.triggerWorkflow(
        {
          customer_id: customerId,
          business_id: selectedBusinessId,
          workflow_type: workflowType,
        },
        token,
      )

      setWorkflowStatus({
        type: workflowType,
        status: "complete",
        message: `${workflowType === "analyze_business" ? "Analysis" : workflowType === "discover_prospects" ? "Prospect discovery" : "Email generation"} complete!`,
      })

      // Refresh data after workflow completes
      setTimeout(async () => {
        if (workflowType === "discover_prospects") {
          const prospectsData = await api.getProspectsForBusiness(selectedBusinessId, token)
          setProspects(prospectsData.prospects || [])
        }
        setWorkflowStatus(null)
      }, 2000)
    } catch (err) {
      console.error("[v0] Workflow trigger failed:", err)
      setWorkflowStatus({ type: workflowType, status: "error", message: "Workflow failed" })
      setTimeout(() => setWorkflowStatus(null), 3000)
    }
  }

  const handleViewProspects = async (businessId: string) => {
    const token = localStorage.getItem("sessionToken")
    if (!token) return

    try {
      setSelectedBusinessId(businessId)
      const prospectsData = await api.getProspectsForBusiness(businessId, token)
      setProspects(prospectsData.prospects || [])
      setShowProspects(true)
    } catch (err) {
      console.error("[v0] Load prospects failed:", err)
      setError("Failed to load prospects")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("sessionToken")
    localStorage.removeItem("customerId")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId)

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

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Welcome, {user?.email}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-400">Plan: {user?.plan_tier}</span>
                {trialDaysLeft > 0 && (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Trial expires in {trialDaysLeft} days
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/pricing")}
                className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm hover:bg-indigo-500/20 transition"
              >
                Upgrade Plan
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System status */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping absolute"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full relative"></div>
          </div>
          <span className="text-xs text-green-400 font-medium">SYSTEM ONLINE</span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {workflowStatus && (
          <div
            className={`border rounded-xl p-4 flex items-center gap-3 ${
              workflowStatus.status === "complete"
                ? "bg-green-500/10 border-green-500/20"
                : workflowStatus.status === "error"
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-indigo-500/10 border-indigo-500/20"
            }`}
          >
            {workflowStatus.status === "running" && <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />}
            {workflowStatus.status === "complete" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            {workflowStatus.status === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className="text-sm">{workflowStatus.message}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{businesses.length}</div>
            <div className="text-sm text-gray-400">Businesses</div>
          </div>

          <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{prospects.length}</div>
            <div className="text-sm text-gray-400">Prospects Discovered</div>
          </div>

          <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{campaigns.length}</div>
            <div className="text-sm text-gray-400">Active Campaigns</div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Businesses list */}
          <div className="lg:col-span-2 bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Businesses</h2>
              <button
                onClick={() => setShowCreateBusiness(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                <Plus className="w-4 h-4" />
                Add Business
              </button>
            </div>

            {businesses.length > 0 ? (
              <div className="space-y-3">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className={`border rounded-xl p-4 cursor-pointer transition ${
                      selectedBusinessId === business.id
                        ? "border-indigo-500 bg-indigo-500/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    onClick={() => setSelectedBusinessId(business.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{business.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{business.industry}</p>
                        <a
                          href={business.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {business.url}
                        </a>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            business.analysis_status === "completed"
                              ? "bg-green-500/10 text-green-400"
                              : business.analysis_status === "in_progress"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {business.analysis_status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewProspects(business.id)
                          }}
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          <Eye className="w-3 h-3" />
                          View Prospects
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No businesses yet</h3>
                <p className="text-sm text-gray-400 mb-6">Add your first business to start generating leads</p>
                <button
                  onClick={() => setShowCreateBusiness(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Business
                </button>
              </div>
            )}
          </div>

          {/* Business actions */}
          <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            {selectedBusiness ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => handleTriggerWorkflow("analyze_business")}
                    disabled={workflowStatus?.status === "running"}
                    className="w-full flex items-center gap-3 p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">Analyze Business</div>
                      <div className="text-xs text-gray-400">AI-powered analysis</div>
                    </div>
                    <Play className="w-4 h-4 text-indigo-400" />
                  </button>

                  <button
                    onClick={() => handleTriggerWorkflow("discover_prospects")}
                    disabled={workflowStatus?.status === "running"}
                    className="w-full flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition disabled:opacity-50"
                  >
                    <Search className="w-5 h-5 text-purple-400" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">Discover Prospects</div>
                      <div className="text-xs text-gray-400">Find 20-50 leads</div>
                    </div>
                    <Play className="w-4 h-4 text-purple-400" />
                  </button>

                  <button
                    onClick={() => handleTriggerWorkflow("generate_emails")}
                    disabled={workflowStatus?.status === "running"}
                    className="w-full flex items-center gap-3 p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">Generate Emails</div>
                      <div className="text-xs text-gray-400">AI email campaign</div>
                    </div>
                    <Play className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <h3 className="text-sm font-medium mb-2">Selected Business</h3>
                  <p className="text-sm text-gray-400">{selectedBusiness.name}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Target className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Select a business to see actions</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Business Modal */}
      {showCreateBusiness && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Create New Business</h3>
              <button onClick={() => setShowCreateBusiness(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  placeholder="Acme Corporation"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Industry</label>
                <select
                  value={businessForm.industry}
                  onChange={(e) => setBusinessForm({ ...businessForm, industry: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Website URL</label>
                <input
                  type="url"
                  value={businessForm.url}
                  onChange={(e) => setBusinessForm({ ...businessForm, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                <p className="text-xs text-indigo-300">
                  Our AI will analyze this business and discover qualified prospects using Google Maps and Apollo.io.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateBusiness(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBusiness}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Business"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prospects Modal */}
      {showProspects && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">Prospects</h3>
                <p className="text-sm text-gray-400 mt-1">{prospects.length} prospects discovered</p>
              </div>
              <button onClick={() => setShowProspects(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {prospects.length > 0 ? (
              <div className="overflow-auto flex-1">
                <table className="w-full">
                  <thead className="border-b border-white/10 sticky top-0 bg-neutral-900">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Company</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Contact</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Industry</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Source</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map((prospect) => (
                      <tr key={prospect.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm">{prospect.company_name}</td>
                        <td className="py-3 px-4 text-sm">{prospect.contact_name}</td>
                        <td className="py-3 px-4 text-sm text-indigo-400">{prospect.contact_email}</td>
                        <td className="py-3 px-4 text-sm">{prospect.industry}</td>
                        <td className="py-3 px-4 text-sm text-gray-400">{prospect.source}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
                            {prospect.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No prospects yet</h3>
                <p className="text-sm text-gray-400">Click "Discover Prospects" to start finding leads</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
