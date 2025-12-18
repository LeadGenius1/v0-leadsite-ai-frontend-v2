"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Target,
  Mail,
  Loader2,
  X,
  Settings,
  Search,
  Send,
  LayoutDashboard,
  BrainCircuit,
  Zap,
  ChevronRight,
  Plus,
  Clock,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  MessageCircle,
  AlertCircle,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("sessionToken")

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
    ...options,
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (res.status === 401) {
    localStorage.clear()
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "API request failed")
  }

  return res.json()
}

interface ProfileData {
  id: number
  customer_id: number
  name: string
  job_title: string
  logo_base64?: string
  business_name: string
  industry: string
  website: string
  street: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
  linkedin?: string
  twitter?: string
  github?: string
  trial_end_date?: string
  analysis_status?: string // Added for analysis status
}

interface QuickStats {
  totalProspects: number
  emailsSent: number
  openRate: number
  replies: number
  hotLeads: number
  deliveryRate: number
  bounceRate: number
}

interface Activity {
  type: "prospect_discovery" | "email_sent" | "email_opened" | "reply_received"
  count: number
  timestamp: string
  description: string
}

interface HotLead {
  id: string
  contact_name: string
  company_name: string
  contact_email: string
  reply_text: string
  sentiment: "positive" | "neutral" | "negative"
  fit_score: number
  replied_at: string
}

interface Campaign {
  id: string
  name: string
  status: "draft" | "sending" | "sent" | "completed"
  total_emails: number
  sent_count: number
  open_count: number
  reply_count: number
  created_at: string
}

interface Prospect {
  id: string
  contact_name: string
  company_name: string
  contact_email: string
  phone: string
  industry: string
  location: string
  quality_score: number
  enrichment_status: "pending" | "enriched" | "failed"
  created_at: string
}

interface Schedule {
  auto_discover_enabled: boolean
  daily_prospect_limit: number
  run_time: string
  next_run?: string
  last_run?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)

  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalProspects: 0,
    emailsSent: 0,
    openRate: 0,
    replies: 0,
    hotLeads: 0,
    deliveryRate: 0,
    bounceRate: 0,
  })

  const [activities, setActivities] = useState<Activity[]>([])
  const [hotLeads, setHotLeads] = useState<HotLead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [schedule, setSchedule] = useState<Schedule>({
    auto_discover_enabled: false,
    daily_prospect_limit: 50,
    run_time: "23:00",
  })

  const [activeSection, setActiveSection] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)

  // Action loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)

  // Modal states
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [showProspects, setShowProspects] = useState(false)
  const [showEmailStats, setShowEmailStats] = useState(false)

  // Toast notification state
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning" | "info"; message: string } | null>(null)

  const statsPollingRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (type: "success" | "error" | "warning" | "info", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    const token = localStorage.getItem("sessionToken")
    if (!token) {
      window.location.href = "/login"
      return
    }

    fetchDashboard()
    fetchQuickStats()
    fetchActivities()

    // Poll stats every 30 seconds
    statsPollingRef.current = setInterval(fetchQuickStats, 30000)

    return () => {
      if (statsPollingRef.current) clearInterval(statsPollingRef.current)
    }
  }, [])

  useEffect(() => {
    if (activeSection === "dashboard") {
      const interval = setInterval(fetchActivities, 60000)
      return () => clearInterval(interval)
    }
  }, [activeSection])

  const fetchDashboard = async () => {
    try {
      const data = await apiCall("/api/dashboard")

      if (data.profile) {
        setProfile(data.profile)

        if (data.profile.trial_end_date) {
          const endDate = new Date(data.profile.trial_end_date)
          const today = new Date()
          const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          setTrialDaysLeft(Math.max(0, daysLeft))
        }
      }

      if (data.hotLeads) {
        setHotLeads(data.hotLeads)
      }

      setLoading(false)
    } catch (error: any) {
      console.error("Error fetching dashboard:", error)
      setLoading(false)
    }
  }

  const fetchQuickStats = async () => {
    try {
      const data = await apiCall("/api/dashboard/quick-stats")
      if (data.stats) {
        setQuickStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching quick stats:", error)
    }
  }

  const fetchActivities = async () => {
    try {
      const data = await apiCall("/api/dashboard/activity?limit=10")
      if (data.activities) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const data = await apiCall("/api/campaigns")
      if (data.campaigns) {
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  const fetchProspects = async () => {
    try {
      const data = await apiCall("/api/prospects")
      if (data.prospects) {
        setProspects(data.prospects)
      }
    } catch (error) {
      console.error("Error fetching prospects:", error)
    }
  }

  const fetchSchedule = async () => {
    try {
      const data = await apiCall("/api/schedule")
      if (data.schedule) {
        setSchedule(data.schedule)
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
    }
  }

  useEffect(() => {
    if (activeSection === "contact") {
      fetchCampaigns()
      fetchProspects()
    } else if (activeSection === "settings") {
      fetchSchedule()
    }
  }, [activeSection])

  const handleAnalyzeBusiness = async () => {
    setIsAnalyzing(true)
    try {
      await apiCall("/api/profile/analyze", { method: "POST" })
      showToast("info", "Business analysis in progress...")

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const data = await apiCall("/api/profile")
        if (data.profile?.analysis_status === "completed") {
          clearInterval(pollInterval)
          setIsAnalyzing(false)
          showToast("success", "Business analysis completed!")
          fetchDashboard()
        }
      }, 3000)

      setTimeout(() => {
        clearInterval(pollInterval)
        setIsAnalyzing(false)
      }, 120000)
    } catch (error: any) {
      setIsAnalyzing(false)
      showToast("error", error.message || "Failed to analyze business")
    }
  }

  const handleDiscoverProspects = async () => {
    setIsDiscovering(true)
    try {
      const customerId = localStorage.getItem("customerId")
      const data = await apiCall("/api/workflows/discover-prospects", {
        method: "POST",
        body: JSON.stringify({ businessId: profile?.id, customerId }),
      })

      showToast("success", `Found ${data.count || 0} prospects!`)
      setIsDiscovering(false)
      fetchQuickStats()
      fetchActivities()
    } catch (error: any) {
      setIsDiscovering(false)
      showToast("error", error.message || "Failed to discover prospects")
    }
  }

  const handleGenerateEmails = async () => {
    if (prospects.length === 0) {
      showToast("warning", "No prospects selected for email generation.")
      return
    }

    setIsGenerating(true)
    try {
      const data = await apiCall("/api/workflows/generate-emails", {
        method: "POST",
        body: JSON.stringify({
          campaignId: campaigns[0]?.id,
          prospectIds: prospects.slice(0, 10).map((p) => p.id),
        }),
      })

      showToast("success", `Generated ${data.count || 0} emails!`)
      setIsGenerating(false)
      fetchQuickStats()
    } catch (error: any) {
      setIsGenerating(false)
      showToast("error", error.message || "Failed to generate emails")
    }
  }

  const handleSendCampaign = async () => {
    if (!campaigns[0]) {
      showToast("warning", "No campaign available to send.")
      return
    }

    setIsSending(true)
    try {
      await apiCall("/api/workflows/send-campaign", {
        method: "POST",
        body: JSON.stringify({ campaignId: campaigns[0].id }),
      })

      showToast("success", "Campaign sent successfully!")
      setIsSending(false)
      fetchQuickStats()
      fetchActivities()
      fetchCampaigns()
    } catch (error: any) {
      setIsSending(false)
      showToast("error", error.message || "Failed to send campaign")
    }
  }

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      showToast("warning", "Please enter a campaign name")
      return
    }

    try {
      const customerId = localStorage.getItem("customerId")
      await apiCall("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({ name: campaignName, business_id: profile?.id, customerId }),
      })

      showToast("success", "Campaign created successfully!")
      setShowCreateCampaign(false)
      setCampaignName("")
      fetchCampaigns()
    } catch (error: any) {
      showToast("error", error.message || "Failed to create campaign")
    }
  }

  const handleSaveSchedule = async () => {
    setSavingSchedule(true)
    try {
      await apiCall("/api/schedule", {
        method: "POST",
        body: JSON.stringify(schedule),
      })

      showToast("success", "Schedule settings saved!")
      setSavingSchedule(false)
      fetchSchedule()
    } catch (error: any) {
      setSavingSchedule(false)
      showToast("error", error.message || "Failed to save schedule")
    }
  }

  const handleProcessReplies = async () => {
    try {
      await apiCall("/api/workflows/process-replies", { method: "POST" })
      showToast("success", "Processing replies...")
      fetchActivities()
      fetchQuickStats()
    } catch (error: any) {
      showToast("error", error.message || "Failed to process replies")
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "prospect_discovery":
        return <Target className="w-4 h-4 text-cyan-400" />
      case "email_sent":
        return <Send className="w-4 h-4 text-purple-400" />
      case "email_opened":
        return <Eye className="w-4 h-4 text-indigo-400" />
      case "reply_received":
        return <MessageCircle className="w-4 h-4 text-green-400" />
      default:
        return <Zap className="w-4 h-4 text-gray-400" />
    }
  }

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return `${diffDays}d ago`
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-600 text-gray-100"
      case "sending":
        return "bg-yellow-600 text-yellow-100"
      case "sent":
        return "bg-green-600 text-green-100"
      case "completed":
        return "bg-blue-600 text-blue-100"
      default:
        return "bg-gray-600 text-gray-100"
    }
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 7) return "text-green-400"
    if (score >= 4) return "text-yellow-400"
    return "text-red-400"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white relative overflow-hidden">
      {/* Space Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg backdrop-blur-xl border
          ${toast.type === "success" ? "bg-green-900/40 border-green-500/50 text-green-100" : ""}
          ${toast.type === "error" ? "bg-red-900/40 border-red-500/50 text-red-100" : ""}
          ${toast.type === "warning" ? "bg-yellow-900/40 border-yellow-500/50 text-yellow-100" : ""}
          ${toast.type === "info" ? "bg-blue-900/40 border-blue-500/50 text-blue-100" : ""}
        `}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex relative z-10">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {profile?.logo_base64 ? (
                <img
                  src={profile.logo_base64 || "/placeholder.svg"}
                  alt="Logo"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <span className="text-lg font-bold">{profile?.name?.charAt(0) || "U"}</span>
                </div>
              )}
              <div>
                <h2 className="text-sm font-semibold">{profile?.name}</h2>
                <p className="text-xs text-gray-400">{profile?.job_title}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">{profile?.business_name}</p>
            {trialDaysLeft > 0 && (
              <div className="mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-200">
                Trial: {trialDaysLeft} days left
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeSection === "dashboard"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveSection("targeting")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeSection === "targeting"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Target className="w-4 h-4" />
              Targeting
            </button>

            <button
              onClick={() => setActiveSection("contact")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeSection === "contact"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Mail className="w-4 h-4" />
              Contact
            </button>

            <button
              onClick={() => setActiveSection("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeSection === "settings"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-4"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto max-h-screen">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              <span className="text-cyan-400">Welcome back,</span> {profile?.email || profile?.name}
            </h1>
            <p className="text-sm text-gray-400">
              {activeSection === "dashboard" && "Here's your AI-powered lead generation overview"}
              {activeSection === "targeting" && "Manage your target audience and discovery settings"}
              {activeSection === "contact" && "View and manage your campaigns and prospects"}
              {activeSection === "settings" && "Configure your automation settings"}
            </p>
          </div>

          {/* Dashboard Section */}
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              {/* Quick Stats - 6 Cards */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="text-purple-400">Quick</span> Stats
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-cyan-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{quickStats.totalProspects}</div>
                    <div className="text-xs text-gray-400">Prospects Discovered</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Send className="w-5 h-5 text-purple-400" />
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{quickStats.emailsSent}</div>
                    <div className="text-xs text-gray-400">Emails Sent</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs text-indigo-300">{quickStats.openRate}%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{quickStats.openRate}%</div>
                    <div className="text-xs text-gray-400">Open Rate</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-green-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{quickStats.replies}</div>
                    <div className="text-xs text-gray-400">Replies</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-yellow-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{quickStats.hotLeads}</div>
                    <div className="text-xs text-gray-400">Hot Leads</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <MousePointerClick className="w-5 h-5 text-blue-400" />
                      <span className="text-xs text-blue-300">{quickStats.deliveryRate}%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{quickStats.deliveryRate}%</div>
                    <div className="text-xs text-gray-400">Delivery Rate</div>
                  </div>
                </div>
              </div>

              {/* AI-Powered Actions - 4 Cards */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="text-cyan-400">AI-Powered</span> Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Analyze Business Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-cyan-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-cyan-500/20 rounded-lg">
                        <BrainCircuit className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">Analyze Business</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          AI analyzes your website to understand your market and ideal customers
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">AI-Powered</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">Insights</span>
                    </div>
                    <button
                      onClick={handleAnalyzeBusiness}
                      disabled={isAnalyzing}
                      className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4" />
                          Analyze Now
                        </>
                      )}
                    </button>
                  </div>

                  {/* Discover Prospects Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Search className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">Discover Prospects</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Find businesses matching your target customer profile using AI-powered search
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">AI-Powered</span>
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded">Enrichment</span>
                    </div>
                    <button
                      onClick={handleDiscoverProspects}
                      disabled={isDiscovering}
                      className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDiscovering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Discovering...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Discover Now
                        </>
                      )}
                    </button>
                  </div>

                  {/* Generate Emails Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-indigo-500/20 rounded-lg">
                        <Zap className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">Generate Emails</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Create personalized outreach emails using AI based on your business profile
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">AI-Generated</span>
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded">Personalized</span>
                    </div>
                    <button
                      onClick={handleGenerateEmails}
                      disabled={isGenerating}
                      className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Generate Now
                        </>
                      )}
                    </button>
                  </div>

                  {/* Send Campaign Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 hover:border-cyan-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-cyan-500/20 rounded-lg">
                        <Send className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">Send Campaign</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Launch your email campaign and track opens, clicks, and replies in real-time
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">Delivery</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">Tracking</span>
                    </div>
                    <button
                      onClick={handleSendCampaign}
                      disabled={isSending}
                      className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="text-indigo-400">Recent</span> Activity
                </h2>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0">
                          <div className="mt-1">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-200">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.timestamp)}</p>
                          </div>
                          {activity.count > 0 && (
                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded font-medium">
                              +{activity.count}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hot Leads */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="text-yellow-400">Hot</span> Leads
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hotLeads.length > 0 ? (
                    hotLeads.slice(0, 3).map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4 hover:border-yellow-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm">{lead.contact_name}</h4>
                            <p className="text-xs text-gray-400">{lead.company_name}</p>
                          </div>
                          <div className="text-xl">
                            {lead.sentiment === "positive" && "👍"}
                            {lead.sentiment === "neutral" && "🔥"}
                            {lead.sentiment === "negative" && "👎"}
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 mb-3 line-clamp-2">{lead.reply_text}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-cyan-400">Score: {lead.fit_score}/10</span>
                          <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                            Reply <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-400">No hot leads yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setActiveSection("contact")
                      setShowCreateCampaign(true)
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg text-sm hover:from-cyan-500/30 hover:to-purple-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    New Campaign
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection("contact")
                      setShowProspects(true)
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    View All Prospects
                  </button>

                  <button
                    onClick={() => setShowEmailStats(true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Email Analytics
                  </button>

                  <button
                    onClick={handleProcessReplies}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Process Replies
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Section - Campaigns & Prospects */}
          {activeSection === "contact" && (
            <div className="space-y-8">
              {/* Campaigns Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    <span className="text-purple-400">Campaigns</span>
                  </h2>
                  <button
                    onClick={() => setShowCreateCampaign(true)}
                    className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-sm hover:from-cyan-600 hover:to-purple-600 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden">
                  {campaigns.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Name</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Total</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Sent</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Opens</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Replies</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign) => (
                          <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-sm">{campaign.name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{campaign.total_emails}</td>
                            <td className="py-3 px-4 text-sm">{campaign.sent_count}</td>
                            <td className="py-3 px-4 text-sm">{campaign.open_count}</td>
                            <td className="py-3 px-4 text-sm">{campaign.reply_count}</td>
                            <td className="py-3 px-4 text-xs text-gray-400">
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No campaigns yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prospects Table */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="text-cyan-400">Prospects</span>
                </h2>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden">
                  {prospects.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Name</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Company</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Email</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Phone</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Industry</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Quality</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prospects.slice(0, 20).map((prospect) => (
                          <tr key={prospect.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-sm">{prospect.contact_name}</td>
                            <td className="py-3 px-4 text-sm">{prospect.company_name}</td>
                            <td className="py-3 px-4 text-xs text-gray-400">{prospect.contact_email}</td>
                            <td className="py-3 px-4 text-xs text-gray-400">{prospect.phone || "—"}</td>
                            <td className="py-3 px-4 text-xs">{prospect.industry}</td>
                            <td className="py-3 px-4">
                              <span className={`text-sm font-semibold ${getQualityScoreColor(prospect.quality_score)}`}>
                                {prospect.quality_score}/10
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-400">{prospect.enrichment_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No prospects yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Section - Schedule Settings */}
          {activeSection === "settings" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="text-indigo-400">Automation</span> Schedule
                </h2>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 space-y-6">
                  {/* Auto Discover Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Enable automatic daily prospect discovery</h3>
                      <p className="text-xs text-gray-400 mt-1">Automatically discover new prospects every night</p>
                    </div>
                    <button
                      onClick={() =>
                        setSchedule({ ...schedule, auto_discover_enabled: !schedule.auto_discover_enabled })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        schedule.auto_discover_enabled ? "bg-cyan-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          schedule.auto_discover_enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Daily Limit */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Daily prospect limit</label>
                    <input
                      type="number"
                      value={schedule.daily_prospect_limit}
                      onChange={(e) =>
                        setSchedule({ ...schedule, daily_prospect_limit: Number.parseInt(e.target.value) || 50 })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50"
                      min="1"
                      max="500"
                    />
                  </div>

                  {/* Run Time */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Run at (24h format)</label>
                    <input
                      type="time"
                      value={schedule.run_time}
                      onChange={(e) => setSchedule({ ...schedule, run_time: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-xs text-blue-200">
                      The system will automatically discover new prospects every night at the specified time, respecting
                      your daily limit. You'll receive an email summary of the results.
                    </p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                    className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingSchedule ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Targeting Section - Business Information */}
          {activeSection === "targeting" && profile && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  <span className="text-purple-400">Business</span> Information
                </h2>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs text-gray-400 uppercase mb-1">Business Name</h4>
                      <p className="text-sm">{profile.business_name}</p>
                    </div>

                    <div>
                      <h4 className="text-xs text-gray-400 uppercase mb-1">Industry</h4>
                      <p className="text-sm">{profile.industry}</p>
                    </div>

                    <div>
                      <h4 className="text-xs text-gray-400 uppercase mb-1">Website</h4>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>

                    <div>
                      <h4 className="text-xs text-gray-400 uppercase mb-1">Address</h4>
                      <p className="text-sm">
                        {profile.street}, {profile.city}, {profile.state} {profile.zip}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs text-gray-400 uppercase mb-1">Email</h4>
                      <p className="text-sm">{profile.email}</p>
                    </div>

                    <div>
                      <h4 className="text-xs text-gray-400 uppercase mb-1">Phone</h4>
                      <p className="text-sm">{profile.phone}</p>
                    </div>

                    {profile.linkedin && (
                      <div>
                        <h4 className="text-xs text-gray-400 uppercase mb-1">LinkedIn</h4>
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-400 hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    )}

                    {profile.twitter && (
                      <div>
                        <h4 className="text-xs text-gray-400 uppercase mb-1">Twitter</h4>
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-400 hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1419] border border-white/20 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Campaign</h3>
              <button onClick={() => setShowCreateCampaign(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Q1 2025 Outreach"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <button
                onClick={handleCreateCampaign}
                className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-sm rounded-lg font-medium transition-all"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Stats Modal */}
      {showEmailStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1419] border border-white/20 rounded-lg w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Email Performance</h3>
              <button onClick={() => setShowEmailStats(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium">Open Rate</span>
                </div>
                <span className="text-2xl font-bold">{quickStats.openRate}%</span>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Replies</span>
                </div>
                <span className="text-2xl font-bold">{quickStats.replies}</span>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Delivery Rate</span>
                </div>
                <span className="text-2xl font-bold">{quickStats.deliveryRate}%</span>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium">Bounce Rate</span>
                </div>
                <span className="text-2xl font-bold">{quickStats.bounceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
