"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
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
  MessageCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// REMOVED TargetingVM type and buildTargetingVM function - not used in dashboard
// REMOVED KeyRow and StatusPill components - not used in dashboard

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

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
  business_name: string
  industry: string
  website: string
  street: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
  logo_base64?: string
  trial_end_date?: string
  analysis_status?: string
  description?: string
  company_size?: string
  year_founded?: string
  target_industries?: string[]
  target_company_sizes?: string[]
  target_job_titles?: string[]
  target_locations?: string[]
  unique_selling_points?: string
  email_tone?: string
  email_style?: string
  email_preferences?: string[]
  target_customer_type?: string
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
  id: number // Changed from string to number
  type: string // Changed from specific enum to string
  title: string // Added title field
  description: string
  timestamp: string
  count?: number // Added count field
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
  enabled: boolean // Renamed from auto_discover_enabled
  dailyLimit: number // Renamed from daily_prospect_limit
  startTime: string // Renamed from run_time
  endTime: string // Added endTime
  timezone: string // Added timezone
  workDays: string[] // Added workDays
}

// const getGreeting = () => {
//   const hour = new Date().getHours()
//   if (hour < 12) return "Good morning"
//   if (hour < 17) return "Good afternoon"
//   return "Good evening"
// }

// const getFirstName = (profile: ProfileData | null) => {
//   if (profile?.business_name) {
//     // Use first word of business name
//     return profile.business_name.split(" ")[0]
//   }
//   if (profile?.email) {
//     // Extract name before @ symbol
//     return profile.email.split("@")[0]
//   }
//   return "there"
// }

export default function DashboardPage() {
  const router = useRouter()
  const statsPollingRef = useRef<NodeJS.Timeout | null>(null)

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // REMOVED targetingVM state - not used in stabilized dashboard
  // REMOVED isAnalyzing state - analysis removed from dashboard

  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

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
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [schedule, setSchedule] = useState<Schedule>({
    enabled: false,
    dailyLimit: 50,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "America/New_York",
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  })

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getFirstName = (profile: ProfileData | null) => {
    if (!profile) return "there"
    const name = profile.name || profile.business_name || ""
    return name.split(" ")[0] || "there"
  }

  useEffect(() => {
    const token = localStorage.getItem("leadsite_token")

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
          logo_base64: data.user.logo_base64, // Added logo_base64
          trial_end_date: data.user.trial_end_date,
          analysis_status: data.user.profile?.analysis_status,
          description: data.user.profile?.description,
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
          target_customer_type: data.user.profile?.target_customer_type, // Added target_customer_type
        }
        setProfile(mappedProfile)
        // REMOVED buildTargetingVM call

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
    } catch (error) {
      console.error("Error fetching quick stats:", error)
      // Keep existing values on error - never block rendering
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
      // Keep existing values on error - never block rendering
    }
  }

  // REMOVED fetchAnalysis function - analysis not part of dashboard contract

  useEffect(() => {
    if (activeSection === "contact") {
      fetchCampaigns()
      fetchProspects()
    } else if (activeSection === "settings") {
      fetchSchedule()
    }
    // REMOVED targeting section handler - analysis handled on separate page
  }, [activeSection])

  // REMOVED handleAnalyzeBusiness function - analysis not triggered from dashboard

  const handleDiscoverProspects = async () => {
    try {
      setIsDiscovering(true)
      await apiCall("/api/discover-prospects", { method: "POST" })
      showToast("success", "Prospect discovery started")
      fetchQuickStats()
      fetchActivities()
    } catch (err: any) {
      console.error(err)
      showToast("error", err.message || "Failed to start discovery")
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleGenerateEmails = async () => {
    try {
      setIsGenerating(true)
      await apiCall("/api/workflows/generate-emails", { method: "POST" })
      showToast("success", "Email generation started")
      fetchActivities()
    } catch (err: any) {
      console.error(err)
      showToast("error", err.message || "Failed to generate emails")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendCampaign = async () => {
    try {
      setIsSending(true)
      await apiCall("/api/workflows/send-campaign", { method: "POST" })
      showToast("success", "Campaign sending started")
      fetchQuickStats()
      fetchActivities()
    } catch (err: any) {
      console.error(err)
      showToast("error", err.message || "Failed to send campaign")
    } finally {
      setIsSending(false)
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

  const saveSchedule = async () => {
    try {
      await apiCall("/api/schedule", {
        method: "POST",
        body: JSON.stringify(schedule),
      })
      showToast("success", "Schedule saved successfully")
    } catch (error) {
      console.error("Error saving schedule:", error)
      showToast("error", "Failed to save schedule")
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-neutral-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border ${
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          } flex items-center gap-2`}
        >
          {toast.type === "success" ? (
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">LeadSite.AI</span>
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
            onClick={() => setActiveSection("ai")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeSection === "ai"
                ? "bg-white/10 text-white border border-white/10"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BrainCircuit className="w-5 h-5" />
            AI Actions
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
            Campaigns
          </button>

          {/* REMOVED Targeting nav item - handled on separate page */}

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
            {/* REMOVED Business Targeting card - targeting handled on separate page */}

            {/* AI Status */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">AI Status</h2>
              <div className="p-4 rounded-xl bg-neutral-900/30 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {isDiscovering || isGenerating || isSending ? "Running" : "Ready"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {activities.length > 0 && activities[0]?.timestamp
                        ? `Last run: ${activities[0].timestamp}`
                        : "No runs yet"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDiscovering || isGenerating || isSending
                      ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                      : "bg-green-500/10 border border-green-500/20 text-green-400"
                  }`}
                >
                  {isDiscovering || isGenerating || isSending ? "In Progress" : "Idle"}
                </span>
              </div>
            </div>

            {/* Performance Snapshot / Quick Stats */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">Performance Snapshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-indigo-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-medium text-white mb-1">{quickStats.totalProspects ?? 0}</p>
                    <p className="text-sm text-neutral-400 font-light">Total Prospects</p>
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-medium text-white mb-1">{quickStats.emailsSent ?? 0}</p>
                    <p className="text-sm text-neutral-400 font-light">Emails Sent</p>
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-cyan-400">
                      <Eye className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-medium text-white mb-1">{quickStats.openRate ?? 0}%</p>
                    <p className="text-sm text-neutral-400 font-light">Open Rate</p>
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-green-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-green-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-medium text-white mb-1">{quickStats.replies ?? 0}</p>
                    <p className="text-sm text-neutral-400 font-light">Replies</p>
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-yellow-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-yellow-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-medium text-white mb-1">{quickStats.hotLeads ?? 0}</p>
                    <p className="text-sm text-neutral-400 font-light">Hot Leads</p>
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-blue-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-medium text-white mb-1">{quickStats.deliveryRate ?? 0}%</p>
                    <p className="text-sm text-neutral-400 font-light">Delivery Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="p-6 rounded-xl bg-neutral-900/30 border border-white/10 text-center">
                    <p className="text-neutral-400 text-sm">No recent activity</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 rounded-xl bg-neutral-900/30 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                          {activity.type === "prospect" && <Users className="w-5 h-5" />}
                          {activity.type === "email" && <Mail className="w-5 h-5" />}
                          {activity.type === "reply" && <MessageCircle className="w-5 h-5" />}
                          {!["prospect", "email", "reply"].includes(activity.type) && <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{activity.title}</p>
                          <p className="text-xs text-neutral-500">{activity.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                          {activity.count ?? 0}
                        </span>
                        <span className="text-xs text-neutral-500">{activity.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Actions Tab */}
        {activeSection === "ai" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">AI Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleDiscoverProspects}
                  disabled={isDiscovering}
                  className="p-6 rounded-xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 text-left disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                    {isDiscovering ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  </div>
                  <h3 className="text-white font-medium mb-1">Discover Prospects</h3>
                  <p className="text-xs text-neutral-500">Find new leads matching your criteria</p>
                </button>

                <button
                  onClick={handleGenerateEmails}
                  disabled={isGenerating}
                  className="p-6 rounded-xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-left disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                    {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mail className="w-6 h-6" />}
                  </div>
                  <h3 className="text-white font-medium mb-1">Generate Emails</h3>
                  <p className="text-xs text-neutral-500">Create personalized outreach emails</p>
                </button>

                <button
                  onClick={handleSendCampaign}
                  disabled={isSending}
                  className="p-6 rounded-xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 text-left disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </div>
                  <h3 className="text-white font-medium mb-1">Send Campaign</h3>
                  <p className="text-xs text-neutral-500">Launch your email campaign</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeSection === "contact" && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Campaigns</h2>
                <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
              <div className="space-y-3">
                {campaigns.length === 0 ? (
                  <div className="p-6 rounded-xl bg-neutral-900/30 border border-white/10 text-center">
                    <p className="text-neutral-400 text-sm">No campaigns yet</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-4 rounded-xl bg-neutral-900/30 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{campaign.name}</p>
                        <p className="text-xs text-neutral-500">{campaign.status}</p>
                      </div>
                      <span className="text-xs text-neutral-400">{campaign.sent ?? 0} sent</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">Prospects</h2>
              <div className="space-y-3">
                {prospects.length === 0 ? (
                  <div className="p-6 rounded-xl bg-neutral-900/30 border border-white/10 text-center">
                    <p className="text-neutral-400 text-sm">No prospects yet</p>
                  </div>
                ) : (
                  prospects.slice(0, 5).map((prospect) => (
                    <div
                      key={prospect.id}
                      className="p-4 rounded-xl bg-neutral-900/30 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{prospect.name}</p>
                        <p className="text-xs text-neutral-500">{prospect.company}</p>
                      </div>
                      <span className="text-xs text-neutral-400">{prospect.email}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeSection === "settings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-white">Automation Schedule</h2>
              <div className="p-6 rounded-xl bg-neutral-900/30 border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Enable Automation</p>
                    <p className="text-xs text-neutral-500">Automatically send emails on schedule</p>
                  </div>
                  <button
                    onClick={() => setSchedule({ ...schedule, enabled: !schedule.enabled })}
                    className={`w-12 h-6 rounded-full transition-all ${
                      schedule.enabled ? "bg-indigo-500" : "bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        schedule.enabled ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-2">Daily Limit</label>
                    <input
                      type="number"
                      value={schedule.dailyLimit}
                      onChange={(e) => setSchedule({ ...schedule, dailyLimit: Number.parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-2">Timezone</label>
                    <select
                      value={schedule.timezone}
                      onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-2">End Time</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <Button onClick={saveSchedule} className="w-full bg-indigo-500 hover:bg-indigo-600">
                  Save Schedule
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
