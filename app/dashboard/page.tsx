"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

interface UserData {
  id: string
  email: string
  company_name: string
  plan_tier: string
  trial_ends_at: string
  trial_days_left: number
}

interface Business {
  id: string
  customer_id: string
  name: string
  industry: string
  website: string
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

const API_URL = "https://api.leadsite.ai"

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

  const [showCreateBusiness, setShowCreateBusiness] = useState(false)
  const [showProspects, setShowProspects] = useState(false)
  const [workflowStatus, setWorkflowStatus] = useState<{
    type: string
    status: "pending" | "running" | "complete" | "error"
    message: string
  } | null>(null)

  const [businessForm, setBusinessForm] = useState({ name: "", industry: "", url: "" })
  const [formLoading, setFormLoading] = useState(false)

  const [isPolling, setIsPolling] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getToken = () => {
    return localStorage.getItem("token")
  }

  const callApi = async (method: string, endpoint: string, body: any = null) => {
    try {
      const token = getToken()
      if (!token) {
        router.push("/login")
        return null
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : null,
      })

      if (response.status === 401) {
        console.log("[Dashboard] 401 Unauthorized - redirecting to login")
        localStorage.removeItem("token")
        router.push("/login")
        return null
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "API request failed")
      }
      return data
    } catch (error: any) {
      console.error("[Dashboard] API Error:", error)
      throw error
    }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    async function loadDashboard() {
      try {
        setLoading(true)

        const dashboardData = await callApi("GET", "/api/dashboard")
        if (!dashboardData) return

        console.log("[Dashboard] Data loaded:", dashboardData)
        setUser(dashboardData.user)
        setTrialDaysLeft(dashboardData.user?.trial_days_left || 0)

        const [businessesData, campaignsData] = await Promise.all([
          callApi("GET", "/api/businesses"),
          callApi("GET", "/api/campaigns"),
        ])

        console.log("[Dashboard] Businesses:", businessesData)
        console.log("[Dashboard] Campaigns:", campaignsData)

        setBusinesses(businessesData?.businesses || [])
        setCampaigns(campaignsData?.campaigns || [])
        setError(null)
      } catch (err: any) {
        console.error("[Dashboard] Load failed:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
    }
  }, [])

  const startPolling = (workflowType: string) => {
    console.log("[Dashboard] Starting polling for workflow:", workflowType)
    setIsPolling(true)

    pollingTimeoutRef.current = setTimeout(() => {
      console.log("[Dashboard] Polling timeout reached (2 minutes)")
      stopPolling()
      setError("Workflow is taking longer than expected. Please check back later.")
    }, 120000)

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const businessesData = await callApi("GET", "/api/businesses")
        if (businessesData?.businesses) {
          console.log("[Dashboard] Polling - businesses updated:", businessesData.businesses)
          setBusinesses(businessesData.businesses)

          const selectedBusiness = businessesData.businesses.find((b: Business) => b.id === selectedBusinessId)
          if (selectedBusiness) {
            if (workflowType === "analyze_business" && selectedBusiness.analysis_status === "completed") {
              console.log("[Dashboard] Analysis completed!")
              stopPolling()
              setWorkflowStatus({
                type: "analyze_business",
                status: "complete",
                message: "Business analysis completed successfully!",
              })
            }
          }
        }

        if (workflowType === "discover_prospects" || workflowType === "generate_emails") {
          const campaignsData = await callApi("GET", "/api/campaigns")
          if (campaignsData?.campaigns) {
            console.log("[Dashboard] Polling - campaigns updated:", campaignsData.campaigns)
            setCampaigns(campaignsData.campaigns)

            const latestCampaign = campaignsData.campaigns[0]
            if (latestCampaign) {
              if (workflowType === "discover_prospects" && latestCampaign.status === "prospects_found") {
                console.log("[Dashboard] Prospects discovered!")
                stopPolling()
                setWorkflowStatus({
                  type: "discover_prospects",
                  status: "complete",
                  message: "Prospects discovered successfully! Click 'View Prospects' to see results.",
                })
                if (selectedBusinessId) {
                  loadProspects(selectedBusinessId)
                }
              } else if (workflowType === "generate_emails" && latestCampaign.status === "sent") {
                console.log("[Dashboard] Emails sent!")
                stopPolling()
                setWorkflowStatus({
                  type: "generate_emails",
                  status: "complete",
                  message: "Email campaign sent successfully!",
                })
              }
            }
          }
        }
      } catch (error) {
        console.error("[Dashboard] Polling error:", error)
      }
    }, 3000)
  }

  const stopPolling = () => {
    console.log("[Dashboard] Stopping polling")
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    setIsPolling(false)

    setTimeout(() => {
      setWorkflowStatus(null)
    }, 3000)
  }

  const handleTriggerWorkflow = async (workflowType: "analyze_business" | "discover_prospects" | "generate_emails") => {
    if (!selectedBusinessId) {
      setError("Please select a business first")
      return
    }

    try {
      console.log("[Dashboard] Triggering workflow:", workflowType, "for business:", selectedBusinessId)

      setWorkflowStatus({
        type: workflowType,
        status: "running",
        message: getWorkflowMessage(workflowType, "running"),
      })
      setError(null)

      if (workflowType === "analyze_business") {
        await callApi("POST", `/api/businesses/${selectedBusinessId}/analyze`, {})
        console.log("[Dashboard] Business analysis triggered")
        startPolling(workflowType)
      } else if (workflowType === "discover_prospects") {
        console.log("[Dashboard] Creating campaign first...")
        const campaignData = await callApi("POST", "/api/campaigns", {
          name: `Campaign ${new Date().toLocaleDateString()}`,
          business_id: selectedBusinessId,
        })

        if (!campaignData?.campaign?.id) {
          throw new Error("Failed to create campaign")
        }

        console.log("[Dashboard] Campaign created:", campaignData.campaign.id)

        await callApi("POST", `/api/campaigns/${campaignData.campaign.id}/discover-prospects`, {})
        console.log("[Dashboard] Prospect discovery triggered")

        const campaignsData = await callApi("GET", "/api/campaigns")
        setCampaigns(campaignsData?.campaigns || [])

        startPolling(workflowType)
      } else if (workflowType === "generate_emails") {
        const latestCampaign = campaigns.find((c) => c.business_id === selectedBusinessId)

        if (!latestCampaign) {
          setError("No campaign found. Please discover prospects first.")
          setWorkflowStatus(null)
          return
        }

        await callApi("POST", `/api/campaigns/${latestCampaign.id}/send`, {})
        console.log("[Dashboard] Email send triggered")
        startPolling(workflowType)
      }
    } catch (err: any) {
      console.error("[Dashboard] Workflow trigger failed:", err)
      setWorkflowStatus({
        type: workflowType,
        status: "error",
        message: `Workflow failed: ${err.message}`,
      })
      stopPolling()
    }
  }

  const getWorkflowMessage = (type: string, status: string) => {
    const messages: Record<string, Record<string, string>> = {
      analyze_business: {
        running: "Analyzing business with AI...",
        complete: "Business analysis completed!",
      },
      discover_prospects: {
        running: "Discovering prospects from Google Maps and Apollo.io...",
        complete: "Prospects discovered successfully!",
      },
      generate_emails: {
        running: "Generating and sending personalized emails...",
        complete: "Emails sent successfully!",
      },
    }
    return messages[type]?.[status] || "Processing..."
  }

  const loadProspects = async (businessId: string) => {
    try {
      console.log("[Dashboard] Loading prospects for business:", businessId)
      const data = await callApi("GET", `/api/prospects?business_id=${businessId}`)
      console.log("[Dashboard] Prospects loaded:", data)
      setProspects(data?.prospects || [])
    } catch (error) {
      console.error("[Dashboard] Failed to load prospects:", error)
      setError("Failed to load prospects")
    }
  }

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessForm.name || !businessForm.industry || !businessForm.url) {
      setError("Please fill in all fields")
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      // Call correct endpoint with correct field names
      await callApi("POST", "/api/businesses", {
        name: businessForm.name,
        industry: businessForm.industry,
        url: businessForm.url,
      })

      // Reload businesses
      const businessesData = await callApi("GET", "/api/businesses")
      setBusinesses(businessesData?.businesses || [])

      // Reset form and close modal
      setBusinessForm({ name: "", industry: "", url: "" })
      setShowCreateBusiness(false)

      setWorkflowStatus({
        type: "create_business",
        status: "complete",
        message: "Business added successfully!",
      })
      setTimeout(() => setWorkflowStatus(null), 3000)
    } catch (err: any) {
      setError(`Failed to create business: ${err.message}`)
    } finally {
      setFormLoading(false)
    }
  }

  const handleViewProspects = async (businessId: string) => {
    await loadProspects(businessId)
    setShowProspects(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
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
              <h1 className="text-xl font-semibold">Welcome,</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-400">Plan: {user?.plan_tier || "free"}</span>
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
                        
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {business.website}
                        </a>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            business.analysis_status === "completed"
                              ? "bg-green-500/10 text-green-400"
                              : business.analysis_status === "processing"
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

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  placeholder="Acme Corporation"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Industry</label>
                <select
                  required
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
                  required
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
                  type="button"
                  onClick={() => setShowCreateBusiness(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
            </form>
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
