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
  Plus,
  Clock,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  MessageCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button" // Assuming Button is in this path

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

// All AI actions now route through backend API

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("leadsite_token")

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
  description?: string // Added for description

  // Onboarding data fields for AI agent
  company_size?: string
  year_founded?: string
  target_customer_type?: string
  target_industries?: string
  target_company_sizes?: string
  target_job_titles?: string
  target_locations?: string
  services?: string
  unique_selling_points?: string
  customer_pain_points?: string
  email_tone?: string
  email_style?: string
  email_preferences?: {
    include_case_studies: boolean
    include_pricing: boolean
  }
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
  id: string // Added id for unique key
  type: "prospect_discovery" | "email_sent" | "email_opened" | "reply_received"
  action: string // Changed from type to action to match update
  count: number | null // Changed to allow null
  timestamp: string
  details?: string // Added for activity details
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

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const getFirstName = (profile: ProfileData | null) => {
  if (profile?.business_name) {
    // Use first word of business name
    return profile.business_name.split(" ")[0]
  }
  if (profile?.email) {
    // Extract name before @ symbol
    return profile.email.split("@")[0]
  }
  return "there"
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
    const token = localStorage.getItem("leadsite_token")
    // REMOVED DEBUG CONSOLE LOGS
    // console.log("[DASHBOARD] Auth check - Token exists:", !!token)
    // console.log("[DASHBOARD] Token value:", token ? `${token.substring(0, 20)}...` : "null")

    if (!token) {
      // REMOVED DEBUG CONSOLE LOGS
      // console.log("[DASHBOARD] No token found, redirecting to login")
      window.location.href = "/login"
      return
    }

    // REMOVED DEBUG CONSOLE LOGS
    // console.log("[DASHBOARD] Token valid, fetching dashboard data")
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
      const data = await apiCall("/api/auth/me")

      if (data.user) {
        const mappedProfile: ProfileData = {
          id: data.user.id,
          customer_id: data.user.customer_id,
          name: data.user.name || "",
          job_title: data.user.job_title || "",
          business_name: data.user.company_name || "",
          industry: data.user.profile?.industry || "",
          website: data.user.profile?.website_url || "",
          street: "",
          city: "",
          state: "",
          zip: "",
          email: data.user.email,
          phone: "",
          trial_end_date: data.user.trial_end_date,
          analysis_status: data.user.profile?.analysis_status,
          description: data.user.profile?.description, // Added description
          company_size: data.user.profile?.company_size,
          year_founded: data.user.profile?.year_founded,
          target_industries: data.user.profile?.target_industries,
          target_company_sizes: data.user.profile?.target_company_sizes,
          target_job_titles: data.user.profile?.target_job_titles,
          target_locations: data.user.profile?.target_locations,
          unique_selling_points: data.user.profile?.unique_selling_points,
          email_tone: data.user.profile?.email_tone,
          email_style: data.user.profile?.email_length,
          email_preferences: data.user.profile?.email_preferences,
        }
        setProfile(mappedProfile)

        if (data.user.trial_end_date) {
          const endDate = new Date(data.user.trial_end_date)
          const today = new Date()
          const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          setTrialDaysLeft(Math.max(0, daysLeft))
        }
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
    } catch (error: any) {
      if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        // Use fallback data - endpoint doesn't exist yet
        return
      }
      console.error("Error fetching quick stats:", error)
    }
  }

  const fetchActivities = async () => {
    try {
      const data = await apiCall("/api/dashboard/activity?limit=10")
      if (data.activities) {
        setActivities(data.activities)
      }
    } catch (error: any) {
      if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        // Use empty array fallback - endpoint doesn't exist yet
        setActivities([])
        return
      }
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
    if (!profile) {
      showToast("error", "Profile data not loaded. Please refresh the page.")
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await apiCall("/api/profile/analyze", {
        method: "POST",
        body: JSON.stringify({
          action: "analyze_business",
          profile,
        }),
      })

      showToast("info", "Business analysis in progress...")
      setIsAnalyzing(false)
      fetchQuickStats()
      fetchActivities()
    } catch (error: any) {
      setIsAnalyzing(false)
      showToast("error", error.message || "Failed to analyze business")
    }
  }

  const handleDiscoverProspects = async () => {
    if (!profile) {
      showToast("error", "Profile data not loaded. Please refresh the page.")
      return
    }

    setIsDiscovering(true)
    try {
      const data = await apiCall("/api/discover-prospects", {
        method: "POST",
        body: JSON.stringify({
          action: "discover_prospects",
          profile,
        }),
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
    if (!profile) {
      showToast("error", "Profile data not loaded. Please refresh the page.")
      return
    }

    if (prospects.length === 0) {
      showToast("warning", "No prospects selected for email generation.")
      return
    }

    setIsGenerating(true)
    try {
      const data = await apiCall("/api/workflows/generate-emails", {
        method: "POST",
        body: JSON.stringify({
          action: "generate_emails",
          profile,
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
    if (!profile) {
      showToast("error", "Profile data not loaded. Please refresh the page.")
      return
    }

    if (campaigns.length === 0) {
      showToast("warning", "No campaign available to send.")
      return
    }

    setIsSending(true)
    try {
      const response = await apiCall("/api/workflows/send-campaign", {
        method: "POST",
        body: JSON.stringify({
          action: "send_campaign",
          profile,
          campaignId: campaigns[0].id,
        }),
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
    if (!profile) {
      showToast("error", "Profile data not loaded. Please refresh the page.")
      return
    }

    try {
      const response = await apiCall("/api/workflows/process-replies", {
        method: "POST",
        body: JSON.stringify({
          action: "process_reply",
          profile,
        }),
      })

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Animated Stars */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="stars absolute w-[1px] h-[1px] bg-transparent rounded-full opacity-50"
            style={{
              boxShadow:
                "1744px 122px #FFF, 134px 1321px #FFF, 92px 859px #FFF, 500px 400px #FFF, 1200px 800px #FFF, 300px 200px #FFF, 800px 600px #FFF, 1500px 1000px #FFF",
              animation: "animStar 50s linear infinite",
            }}
          />
        </div>

        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundSize: "40px 40px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />

        {/* Glow Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : toast.type === "error"
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : toast.type === "warning"
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                  : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex relative z-10">
        <aside className="w-64 bg-black/50 backdrop-blur-md border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full" />
              <span className="text-lg font-medium tracking-wider">LeadSite.AI</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeSection === "dashboard"
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveSection("targeting")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeSection === "targeting"
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Target className="w-5 h-5" />
              Targeting
            </button>

            <button
              onClick={() => setActiveSection("contact")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeSection === "contact"
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Mail className="w-5 h-5" />
              Contact
            </button>

            <button
              onClick={() => setActiveSection("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeSection === "settings"
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
              {profile?.logo_base64 ? (
                <img
                  src={profile.logo_base64 || "/placeholder.svg"}
                  alt="Logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {profile?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.name}</p>
                <p className="text-xs text-neutral-500 truncate">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto max-h-screen">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              DASHBOARD ACTIVE
            </div>

            <h1 className="text-3xl md:text-4xl font-medium tracking-tight bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent mb-2">
              {getGreeting()}, {getFirstName(profile)}!
            </h1>

            <p className="text-neutral-400 text-sm font-light">Here's your AI-powered lead generation overview</p>
          </div>

          {trialDaysLeft > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left in your free trial
                  </p>
                  <p className="text-xs text-neutral-400">Unlock unlimited leads and emails</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              >
                Upgrade Now
              </Button>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-white">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-indigo-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-3xl font-medium text-white mb-1">{quickStats.totalProspects}</p>
                      <p className="text-sm text-neutral-400 font-light">Total Prospects</p>
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-400">
                        <Send className="w-5 h-5" />
                      </div>
                      <p className="text-3xl font-medium text-white mb-1">{quickStats.emailsSent}</p>
                      <p className="text-sm text-neutral-400 font-light">Emails Sent</p>
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-cyan-400">
                        <Eye className="w-5 h-5" />
                      </div>
                      <p className="text-3xl font-medium text-white mb-1">{quickStats.openRate}%</p>
                      <p className="text-sm text-neutral-400 font-light">Open Rate</p>
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-green-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-green-400">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <p className="text-3xl font-medium text-white mb-1">{quickStats.replies}</p>
                      <p className="text-sm text-neutral-400 font-light">Replies</p>
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-yellow-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-yellow-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <p className="text-3xl font-medium text-white mb-1">{quickStats.hotLeads}</p>
                      <p className="text-sm text-neutral-400 font-light">Hot Leads</p>
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-blue-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <p className="text-3xl font-medium text-white mb-1">{quickStats.deliveryRate}%</p>
                      <p className="text-sm text-neutral-400 font-light">Delivery Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 text-white">AI-Powered Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Analyze Business */}
                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-shadow">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Analyze Business</h3>
                      <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                        AI analyzes your website to understand your market and ideal customers
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                          AI-Powered
                        </span>
                      </div>
                      <button
                        onClick={handleAnalyzeBusiness}
                        disabled={isAnalyzing}
                        className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#22d3ee_50%,#000_100%)]" />
                        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {isAnalyzing ? "Analyzing..." : "Analyze"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Discover Prospects */}
                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-shadow">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Discover Prospects</h3>
                      <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                        Find businesses matching your target customer profile
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                          Automated
                        </span>
                      </div>
                      <button
                        onClick={handleDiscoverProspects}
                        disabled={isDiscovering}
                        className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#a855f7_50%,#000_100%)]" />
                        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                          {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {isDiscovering ? "Discovering..." : "Discover"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Generate Emails */}
                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-shadow">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Generate Emails</h3>
                      <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                        Create personalized outreach emails using AI
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                          Personalized
                        </span>
                      </div>
                      <button
                        onClick={handleGenerateEmails}
                        disabled={isGenerating}
                        className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#6366f1_50%,#000_100%)]" />
                        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {isGenerating ? "Generating..." : "Generate"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Send Campaign */}
                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-shadow">
                        <Send className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Send Campaign</h3>
                      <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                        Launch your email campaign and track results
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                          Tracking
                        </span>
                      </div>
                      <button
                        onClick={handleSendCampaign}
                        disabled={isSending}
                        className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#22d3ee_50%,#000_100%)]" />
                        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                          {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {isSending ? "Sending..." : "Send"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
                <div className="space-y-2">
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="group p-4 rounded-xl bg-neutral-900/30 border border-white/10 hover:bg-neutral-900/50 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 flex-shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm text-white font-medium">{activity.action}</p>
                              <span className="text-xs text-neutral-500 whitespace-nowrap">{activity.timestamp}</span>
                            </div>
                            {activity.details && (
                              <p className="text-xs text-neutral-400 leading-relaxed">{activity.details}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                                {activity.count ?? 0} items
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
                <div className="relative px-6 py-4 border-b border-white/5">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                  <h3 className="text-lg font-medium text-white">Hot Leads</h3>
                  <p className="text-sm text-neutral-500">High-intent prospects ready for outreach</p>
                </div>

                {hotLeads.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {hotLeads.map((lead) => (
                      <div key={lead.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                            {lead.contact_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{lead.contact_name}</p>
                            <p className="text-xs text-neutral-500">{lead.company_name}</p>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
                            Score: {lead.fit_score}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Users className="w-8 h-8 text-neutral-600" />
                    </div>
                    <p className="text-neutral-400 text-sm">No hot leads yet</p>
                    <p className="text-neutral-600 text-xs mt-1">Start discovering prospects to see hot leads here</p>
                  </div>
                )}
              </div>

              {/* Quick Actions Bar */}
              <div className="rounded-2xl bg-neutral-900/30 border border-white/10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setActiveSection("contact")
                      setShowCreateCampaign(true)
                    }}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection("contact")
                      setShowProspects(true)
                    }}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    View All Prospects
                  </button>
                  <button
                    onClick={() => setShowEmailStats(true)}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Email Analytics
                  </button>
                  <button
                    onClick={handleProcessReplies}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
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
                <h2 className="text-2xl font-semibold mb-6 text-white">Business Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Business Name</label>
                      <p className="text-white">{profile.business_name || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Industry</label>
                      <p className="text-white">{profile.industry || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Website</label>
                      <p className="text-white">{profile.website || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Company Size</label>
                      <p className="text-white">{profile.company_size ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Year Founded</label>
                      <p className="text-white">{profile.year_founded ?? "Not set"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
                      <p className="text-white">{profile.description || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Address</label>
                      <p className="text-white">
                        {profile.street ?? "Not set"}
                        {profile.city && `, ${profile.city}`}
                        {profile.state && `, ${profile.state}`}
                        {profile.zip && ` ${profile.zip}`}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">Phone</label>
                      <p className="text-white">{profile.phone ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">LinkedIn</label>
                      <p className="text-white">{profile.linkedin ?? "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 text-white">Target Customer Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Target Customer Type</label>
                    <p className="text-white">{profile.target_customer_type ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Target Industries</label>
                    <p className="text-white">{profile.target_industries ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Target Company Sizes</label>
                    <p className="text-white">{profile.target_company_sizes ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Target Job Titles</label>
                    <p className="text-white">{profile.target_job_titles ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Target Locations</label>
                    <p className="text-white">{profile.target_locations ?? "Not set"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 text-white">Positioning & Messaging</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Services</label>
                    <p className="text-white">{profile.services ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Unique Selling Points</label>
                    <p className="text-white">{profile.unique_selling_points ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Customer Pain Points</label>
                    <p className="text-white">{profile.customer_pain_points ?? "Not set"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6 text-white">Email Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Email Tone</label>
                    <p className="text-white">{profile.email_tone ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Email Style</label>
                    <p className="text-white">{profile.email_style ?? "Not set"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Include in Emails</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.email_preferences?.include_case_studies ?? false}
                          readOnly
                          className="rounded"
                        />
                        <span className="text-white">Case Studies & Success Stories</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.email_preferences?.include_pricing ?? false}
                          readOnly
                          className="rounded"
                        />
                        <span className="text-white">Pricing Information</span>
                      </div>
                    </div>
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
