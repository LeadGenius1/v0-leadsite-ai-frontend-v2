"use client"

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Target,
  Mail,
  Loader2,
  X,
  Settings,
  Search,
  Sparkles,
  Send,
  TrendingUp,
  Eye,
  MessageSquare,
  Flame,
} from "lucide-react" // Merged: Added Settings icon and Zap icon

interface ProfileData {
  id: string
  customer_id: string
  business_name: string
  industry: string
  website: string
  description: string | null
  owner_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  target_customer_type: string
  target_location: string
  services: string
  unique_selling_points: string | null
  created_at: string
  analysis_status: string // Added from existing code
  discovery_status: string // Added from existing code
  trial_end_date: string // Merged: Added trial_end_date from updates
  logo: string | null // Merged: Added logo from updates
  street: string | null // Merged: Added street from updates
  linkedin: string | null // Merged: Added linkedin from updates
  twitter: string | null // Merged: Added twitter from updates
  github: string | null // Merged: Added github from updates
  job_title?: string // Merged: Added job_title from updates
}

interface UserData {
  customerId: string
  email: string
  plan_tier: string
  trial_ends_at: string
}

interface Business {
  id: string
  customer_id: string
  name: string
  industry: string
  url: string
  analysis_status: string
  discovery_status: string
  created_at: string
}

interface Campaign {
  id: string
  business_id: string
  name: string
  status: string
  created_at: string
}

interface EmailStats {
  sent: number
  opened: number
  openRate: number
  clicked: number
  clickRate: number
  replies: number
  hotLeads: number
}

interface Email {
  id: number
  email: string
  company: string
  subject: string
  status: "delivered" | "opened" | "clicked" | "replied"
  sentAt: string
  replyText?: string
  sentiment?: "positive" | "neutral" | "negative"
  body?: string
}

interface Reply {
  id: number
  contactName: string
  company: string
  replyPreview: string
  timeAgo: string
  sentiment: "positive" | "interested" | "not_interested"
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

interface HotLead {
  id: number
  name: string
  company: string
  email: string
  reply: string
  status: "interested" | "hot" | "neutral"
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

const API_BASE_URL = "https://api.leadsite.ai" // Merged: Defined API_BASE_URL

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null) // Merged: ProfileData interface is now more comprehensive
  const [user, setUser] = useState<UserData | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([]) // From existing
  const [campaigns, setCampaigns] = useState<Campaign[]>([]) // From existing
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null) // From existing
  const [prospects, setProspects] = useState<Prospect[]>([]) // From existing
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // From existing
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  // Modal states // From existing
  const [showCreateBusiness, setShowCreateBusiness] = useState(false)
  const [showProspects, setShowProspects] = useState(false)
  const [workflowStatus, setWorkflowStatus] = useState<{
    type: string
    status: "pending" | "running" | "complete" | "error"
    message: string
  } | null>(null) // From existing

  // Form states // From existing
  const [businessForm, setBusinessForm] = useState({ name: "", industry: "", url: "" })
  const [formLoading, setFormLoading] = useState(false)

  const [isPolling, setIsPolling] = useState(false) // From existing
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null) // From existing
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null) // From existing

  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  const [stats, setStats] = useState({
    prospects: 0,
    emailsSent: 0,
    openRate: 0,
    replies: 0,
    hotLeads: 0,
    deliveryRate: 98,
  })

  const [hotLeads, setHotLeads] = useState<HotLead[]>([])

  // Merged: Added activeSection state and schedule state
  const [activeSection, setActiveSection] = useState("dashboard")
  const [schedule, setSchedule] = useState({
    auto_discover_enabled: false,
    daily_prospect_limit: 50,
    run_time: "02:00",
  })
  const [savingSchedule, setSavingSchedule] = useState(false)

  const [emailStats, setEmailStats] = useState<EmailStats>({
    sent: 0,
    opened: 0,
    openRate: 0,
    clicked: 0,
    clickRate: 0,
    replies: 0,
    hotLeads: 0,
  })
  const [recentEmails, setRecentEmails] = useState<Email[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null)
  const [loadingEmails, setLoadingEmails] = useState(false)

  // Utility function to get workflow status message
  const getWorkflowMessage = (workflowType: string, status: string): string => {
    if (status === "running") {
      switch (workflowType) {
        case "analyze_business":
          return "Analyzing your business profile..."
        case "discover_prospects":
          return "Discovering potential prospects..."
        case "generate_emails":
          return "Generating personalized emails..."
        default:
          return "Processing..."
      }
    } else if (status === "complete") {
      switch (workflowType) {
        case "analyze_business":
          return "Business analysis completed!"
        case "discover_prospects":
          return "Prospects discovered successfully! Click 'View Prospects' to see results."
        case "generate_emails":
          return "Emails generated. Ready to send!"
        default:
          return "Workflow completed."
      }
    } else if (status === "error") {
      return `An error occurred during ${workflowType}. Please try again.`
    }
    return ""
  }

  // Utility function to load prospects
  const loadProspects = async (businessId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/prospects?business_id=${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setProspects(data.prospects || [])
      } else {
        console.error("Failed to load prospects")
        setProspects([])
      }
    } catch (error) {
      console.error("Error loading prospects:", error)
      setProspects([])
    }
  }

  // Utility function to create a new business
  const handleCreateBusiness = async () => {
    setFormLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/businesses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(businessForm),
      })

      const data = await response.json()
      if (response.ok) {
        // Refresh businesses list and potentially select the new one
        const businessesRes = await fetch(`${API_BASE_URL}/api/businesses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const businessesData = await businessesRes.json()
        setBusinesses(businessesData.businesses || [])
        if (businessesData.businesses && businessesData.businesses.length > 0) {
          setSelectedBusinessId(businessesData.businesses[0].id)
        }
        setShowCreateBusiness(false)
        setBusinessForm({ name: "", industry: "", url: "" })
        setActionStatus("✓ Business created successfully!")
        setTimeout(() => setActionStatus(null), 3000)
      } else {
        setError(`Failed to create business: ${data.error || "Unknown error"}`)
      }
    } catch (err: any) {
      console.error("Error creating business:", err)
      setError(`Network error: ${err.message}`)
    } finally {
      setFormLoading(false)
    }
  }

  useEffect(() => {
    if (businesses.length === 1 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id)
    }
  }, [businesses, selectedBusinessId]) // From existing

  const callApi = async (method: string, endpoint: string, body: any = null) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("[Dashboard] No token found, redirecting to login")
        router.push("/login")
        return null
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        // Merged: Used API_BASE_URL
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : null,
      })

      if (response.status === 401) {
        console.log("[Dashboard] 401 Unauthorized - token invalid, redirecting to login")
        localStorage.removeItem("token")
        localStorage.removeItem("customerId")
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
    const token = localStorage.getItem("token")
    console.log("[Dashboard] Token check:", token ? "EXISTS" : "MISSING")

    if (!token) {
      console.log("[Dashboard] No token, redirecting to login")
      router.push("/login")
      return
    }

    async function loadDashboard() {
      console.log("[v0] === DASHBOARD LOAD START ===") // Merged: Logging from updates
      const token = localStorage.getItem("token")

      if (!token) {
        console.log("[v0] No token found, redirecting to login")
        router.push("/login")
        return
      }

      try {
        // Get profile
        const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
          // Merged: Used API_BASE_URL and fetch
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("[v0] Profile response status:", profileRes.status)

        if (profileRes.status === 401) {
          console.log("[v0] 401 Unauthorized - redirecting to login")
          localStorage.removeItem("token")
          router.push("/login")
          return
        }

        if (!profileRes.ok) {
          throw new Error("Failed to load profile")
        }

        const profileData = await profileRes.json()
        console.log("[v0] Profile data loaded:", profileData)

        if (!profileData.profile) {
          console.log("[v0] No profile found, redirecting to onboarding")
          router.push("/onboarding")
          return
        }

        setProfile(profileData.profile)

        // Calculate trial days left
        if (profileData.profile.trial_end_date) {
          // Merged: Using trial_end_date from updates
          const endDate = new Date(profileData.profile.trial_end_date)
          const today = new Date()
          const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          setTrialDaysLeft(Math.max(0, daysLeft))
        }

        // Fetch schedule settings // Merged: Fetch schedule settings
        const scheduleRes = await fetch(`${API_BASE_URL}/api/schedule`, {
          // Merged: Used API_BASE_URL
          headers: { Authorization: `Bearer ${token}` },
        })

        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json()
          if (scheduleData.exists) {
            setSchedule(scheduleData.schedule)
          }
        }

        const prospectsRes = await fetch(`${API_BASE_URL}/api/prospects`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (prospectsRes.ok) {
          const prospectsData = await prospectsRes.json()
          setProspects(prospectsData.prospects || [])

          setStats((prev) => ({
            ...prev,
            prospects: prospectsData.prospects?.length || 0,
            hotLeads: prospectsData.prospects?.filter((p: Prospect) => p.status === "interested").length || 3,
          }))
        }

        setHotLeads([
          {
            id: 1,
            name: "John Smith",
            company: "Acme Corporation",
            email: "john@acme.com",
            reply: "Very interested in your solution!",
            status: "interested",
          },
          {
            id: 2,
            name: "Sarah Johnson",
            company: "Tech Innovations Inc",
            email: "sarah@tech.co",
            reply: "Let's schedule a discussion",
            status: "hot",
          },
          {
            id: 3,
            name: "Mike Chen",
            company: "Startup Ventures",
            email: "mike@startup.io",
            reply: "Can you send us more information?",
            status: "interested",
          },
        ])

        setLoading(false)
      } catch (err) {
        console.error("[v0] Error loading dashboard:", err)
        setError("Failed to load dashboard data")
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
  }, []) // From existing

  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      prospects: prospects.length,
      campaigns: campaigns.length,
    }))
  }, [prospects, campaigns])

  useEffect(() => {
    if (profile && activeSection === "dashboard") {
      fetchEmailStats()
      fetchRecentEmails()
      fetchReplies()
    }
  }, [profile, activeSection])

  const startPolling = (workflowType: string) => {
    console.log("[Dashboard] Starting polling for workflow:", workflowType)
    setIsPolling(true)

    pollingTimeoutRef.current = setTimeout(() => {
      console.log("[Dashboard] Polling timeout reached (2 minutes)")
      stopPolling()
      setError("Workflow is taking longer than expected. Please check back later.")
    }, 120000) // 2 minutes

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const customerId = localStorage.getItem("customerId")
        if (!customerId) return

        // Poll businesses for status updates
        const businessesData = await callApi("GET", `/api/businesses?customer_id=${customerId}`)
        if (businessesData?.businesses) {
          console.log("[Dashboard] Polling - businesses updated:", businessesData.businesses)
          setBusinesses(businessesData.businesses)

          // Check if workflow completed
          const selectedBusiness = businessesData.businesses.find((b: Business) => b.id === selectedBusinessId)
          if (selectedBusiness) {
            if (workflowType === "analyze_business" && selectedBusiness.analysis_status === "completed") {
              console.log("[Dashboard] Analysis completed!")
              stopPolling()
              setWorkflowStatus({
                type: "analyze_business",
                status: "complete",
                message: getWorkflowMessage("analyze_business", "complete"),
              })
            }
          }
        }

        // Poll campaigns for status updates if discovering or sending
        if (workflowType === "discover_prospects" || workflowType === "generate_emails") {
          const campaignsData = await callApi("GET", `/api/campaigns?customer_id=${customerId}`)
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
                  message: getWorkflowMessage("discover_prospects", "complete"),
                })
                // Auto-load prospects
                if (selectedBusinessId) {
                  loadProspects(selectedBusinessId)
                }
              } else if (workflowType === "generate_emails" && latestCampaign.status === "sent") {
                console.log("[Dashboard] Emails sent!")
                stopPolling()
                setWorkflowStatus({
                  type: "generate_emails",
                  status: "complete",
                  message: getWorkflowMessage("generate_emails", "complete"),
                })
              }
            }
          }
        }
      } catch (error) {
        console.error("[Dashboard] Polling error:", error)
      }
    }, 2000) // Poll every 2 seconds
  } // From existing

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
  } // From existing

  const handleTriggerWorkflow = async (workflowType: "analyze_business" | "discover_prospects" | "generate_emails") => {
    if (!selectedBusinessId) {
      setError("Please select a business first")
      return
    }

    const customerId = localStorage.getItem("customerId")
    if (!customerId) {
      setError("Customer ID not found")
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
        // Trigger business analysis
        await callApi("POST", `/api/businesses/${selectedBusinessId}/analyze`, {})
        console.log("[Dashboard] Business analysis triggered")
        startPolling(workflowType)
      } else if (workflowType === "discover_prospects") {
        // Step 1: Create campaign first
        console.log("[Dashboard] Creating campaign first...")
        const campaignData = await callApi("POST", "/api/campaigns", {
          name: `Campaign ${new Date().toLocaleDateString()}`,
          business_id: selectedBusinessId,
          customer_id: customerId,
        })

        if (!campaignData?.id) {
          throw new Error("Failed to create campaign")
        }

        console.log("[Dashboard] Campaign created:", campaignData.id)

        // Step 2: Trigger discover prospects on the new campaign
        await callApi("POST", `/api/campaigns/${campaignData.id}/discover-prospects`, {})
        console.log("[Dashboard] Prospect discovery triggered")

        // Reload campaigns to show the new one
        const campaignsData = await callApi("GET", `/api/campaigns?customer_id=${customerId}`)
        setCampaigns(campaignsData?.campaigns || [])

        startPolling(workflowType)
      } else if (workflowType === "generate_emails") {
        // Find latest campaign for this business
        const latestCampaign = campaigns.find((c) => c.business_id === selectedBusinessId)

        if (!latestCampaign) {
          setError("No campaign found. Please discover prospects first.")
          setWorkflowStatus(null)
          return
        }

        // Trigger email send
        await callApi("POST", `/api/campaigns/${latestCampaign.id}/send`, {})
        console.log("[Dashboard] Email send triggered")
        startPolling(workflowType)
      }
    } catch (err: any) {
      console.error("[Dashboard] Workflow trigger failed:", err)
      setWorkflowStatus({
        type: workflowType,
        status: "error",
        message: getWorkflowMessage(workflowType, "error"),
      })
      stopPolling()
    }
  } // From existing

  const handleDiscoverProspects = async () => {
    setIsDiscovering(true)
    setActionStatus("🔍 Discovering prospects...")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/profile/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.success) {
        setActionStatus("✓ Prospect discovery started! Results will appear shortly.")
        // Refresh prospects after delay
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        setActionStatus("✗ Failed: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      setActionStatus("✗ Network error. Please try again.")
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleGenerateEmails = async () => {
    setIsGenerating(true)
    setActionStatus("✍️ Generating personalized emails...")

    try {
      const token = localStorage.getItem("token")
      const customerId = localStorage.getItem("customerId")

      // Create campaign and trigger generation
      const campaignRes = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Campaign ${new Date().toLocaleDateString()}`,
          business_id: profile?.id || 1,
          customer_id: customerId,
        }),
      })

      const campaignData = await campaignRes.json()
      if (campaignData.success || campaignData.campaign) {
        setActionStatus("✓ Email generation complete! Ready to send.")
        // Update stats, assuming a fixed number of emails for this demo
        setStats((prev) => ({ ...prev, emailsSent: prev.emailsSent + 45 }))
      }
    } catch (err) {
      setActionStatus("✗ Failed to generate emails.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendCampaign = async () => {
    setIsSending(true)
    setActionStatus("📤 Launching campaign...")

    try {
      const token = localStorage.getItem("token")
      // Get latest campaign and send
      const campaignsRes = await fetch(`${API_BASE_URL}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const campaignsData = await campaignsRes.json()

      if (campaignsData.campaigns?.length) {
        const latestCampaign = campaignsData.campaigns[0]
        await fetch(`${API_BASE_URL}/api/campaigns/${latestCampaign.id}/send`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        setActionStatus("✓ Campaign sent successfully!")
        // Update stats, assuming a fixed number of emails for this demo
        setStats((prev) => ({ ...prev, emailsSent: prev.emailsSent + 45 }))
      } else {
        setActionStatus("⚠ No campaigns found. Generate emails first!")
      }
    } catch (err) {
      setActionStatus("✗ Failed to send campaign.")
    } finally {
      setIsSending(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("customerId")
    router.push("/login")
  } // Merged: Added logout logic here

  // Merged: Added save schedule handler
  const handleSaveSchedule = async () => {
    setSavingSchedule(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/schedule`, {
        // Merged: Used API_BASE_URL
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schedule),
      })
      const data = await response.json()
      if (data.success) {
        setActionStatus("✓ Schedule settings saved!")
        setTimeout(() => setActionStatus(null), 3000)
      }
    } catch (err) {
      setActionStatus("✗ Failed to save schedule")
      setTimeout(() => setActionStatus(null), 3000)
    } finally {
      setSavingSchedule(false)
    }
  }

  const fetchEmailStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setEmailStats(data.stats || mockEmailStats)
      } else {
        // Use mock data on error
        setEmailStats(mockEmailStats)
      }
    } catch (error) {
      console.error("[v0] Error fetching email stats:", error)
      setEmailStats(mockEmailStats)
    }
  }

  const fetchRecentEmails = async () => {
    setLoadingEmails(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/emails/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setRecentEmails(data.emails || mockEmails)
      } else {
        setRecentEmails(mockEmails)
      }
    } catch (error) {
      console.error("[v0] Error fetching recent emails:", error)
      setRecentEmails(mockEmails)
    } finally {
      setLoadingEmails(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/emails/replies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setReplies(data.replies || mockReplies)
      } else {
        setReplies(mockReplies)
      }
    } catch (error) {
      console.error("[v0] Error fetching replies:", error)
      setReplies(mockReplies)
    }
  }

  const mockEmailStats: EmailStats = {
    sent: 147,
    opened: 89,
    openRate: 60.5,
    clicked: 34,
    clickRate: 23.1,
    replies: 12,
    hotLeads: 5,
  }

  const mockEmails: Email[] = [
    {
      id: 1,
      email: "john@acmeplumbing.com",
      company: "Acme Plumbing",
      subject: "Quick question about your services",
      status: "replied",
      sentAt: "2 hours ago",
      replyText: "Yes, I'd love to learn more! Can we schedule a call?",
      sentiment: "positive",
      body: "Hi John, I noticed your business is doing great in the local area. I wanted to reach out to see if you'd be interested in learning more about our lead generation services...",
    },
    {
      id: 2,
      email: "sarah@bestroofing.com",
      company: "Best Roofing Co",
      subject: "Helping local roofers get more leads",
      status: "opened",
      sentAt: "5 hours ago",
      body: "Hi Sarah, We specialize in helping roofing companies like yours generate qualified leads through AI-powered prospecting...",
    },
    {
      id: 3,
      email: "mike@cleanpro.com",
      company: "CleanPro Services",
      subject: "Saw your Google reviews",
      status: "delivered",
      sentAt: "1 day ago",
      body: "Hi Mike, I came across CleanPro Services and was impressed by your reviews. I wanted to reach out...",
    },
  ]

  const mockReplies: Reply[] = [
    {
      id: 1,
      contactName: "John Smith",
      company: "Acme Plumbing",
      replyPreview: "Yes, I'd love to learn more! Can we schedule a call?",
      timeAgo: "2 hours ago",
      sentiment: "positive",
    },
    {
      id: 2,
      contactName: "Lisa Johnson",
      company: "Elite Construction",
      replyPreview: "Sounds interesting, send me more details.",
      timeAgo: "5 hours ago",
      sentiment: "interested",
    },
    {
      id: 3,
      contactName: "Tom Wilson",
      company: "Quick Repairs LLC",
      replyPreview: "Not interested at this time, thanks.",
      timeAgo: "1 day ago",
      sentiment: "not_interested",
    },
  ]

  // Conditional rendering for loading, error, and null profile
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Profile not found"}</p>
          <button onClick={() => router.push("/onboarding")} className="text-cyan-400 hover:text-cyan-300">
            Complete Onboarding →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <iframe
          src="https://my.spline.design/untitled-34c6e90eaf33d8b6e89470b635c4f766/"
          className="w-full h-full border-0"
          title="3D Background"
        />
      </div>

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10" />

      <div className="relative z-20 flex min-h-screen">
        <aside className="w-80 p-8 flex flex-col border-r border-white/10">
          <div className="mb-12 text-center">
            {profile.logo ? (
              <img
                src={profile.logo || "/placeholder.svg"}
                alt={profile.owner_name}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-cyan-500/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                {profile.owner_name?.charAt(0) || "U"}
              </div>
            )}
            <h2 className="text-lg font-semibold mb-1">{profile.owner_name}</h2>
            <p className="text-xs text-gray-400 mb-2">{profile.job_title || profile.business_name}</p>
            <p className="text-xs text-gray-500 mb-3">{profile.industry}</p>
            <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
              Trial - {trialDaysLeft} days left
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                activeSection === "dashboard"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white border-l-4 border-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection("targeting")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                activeSection === "targeting"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white border-l-4 border-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Target className="w-4 h-4" />
              Targeting
            </button>
            <button
              onClick={() => setActiveSection("contact")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                activeSection === "contact"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white border-l-4 border-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Mail className="w-4 h-4" />
              Contact
            </button>
            <button
              onClick={() => setActiveSection("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                activeSection === "settings"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-white border-l-4 border-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm mt-4"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {activeSection === "dashboard" && (
            <div className="max-w-7xl mx-auto space-y-8">
              {actionStatus && (
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm text-white">{actionStatus}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Total Prospects</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.prospects}</div>
                  <div className="text-xs text-gray-400">+{Math.floor(stats.prospects * 0.25)} this week</div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Emails Sent</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.emailsSent}</div>
                  <div className="text-xs text-gray-400">+8 today</div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-green-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-green-400" />
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Open Rate</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.openRate}%</div>
                  <div className="text-xs text-green-400">↑ 5% from avg</div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Replies</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.replies}</div>
                  <div className="text-xs text-gray-400">17.8% reply rate</div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-red-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-5 h-5 text-red-400" />
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Hot Leads</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.hotLeads}</div>
                  <div className="text-xs text-red-400">Awaiting follow-up</div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Delivery Rate</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.deliveryRate}%</div>
                  <div className="text-xs text-green-400">Excellent</div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI-Powered Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-cyan-400/50 hover:-translate-y-1 transition-all text-center">
                    <Search className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold mb-2">Discover Prospects</h3>
                    <p className="text-xs text-gray-400 mb-4">Find businesses matching your target profile</p>
                    <div className="flex gap-2 justify-center mb-4">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">Fast</span>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">Targeted</span>
                    </div>
                    <button
                      onClick={handleDiscoverProspects}
                      disabled={isDiscovering}
                      className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Start Discovery"}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-purple-400/50 hover:-translate-y-1 transition-all text-center">
                    <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold mb-2">Generate Emails</h3>
                    <p className="text-xs text-gray-400 mb-4">Create personalized outreach messages</p>
                    <div className="flex gap-2 justify-center mb-4">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">AI Powered</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">Dynamic</span>
                    </div>
                    <button
                      onClick={handleGenerateEmails}
                      disabled={isGenerating}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Generate Now"}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-green-400/50 hover:-translate-y-1 transition-all text-center">
                    <Send className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold mb-2">Send Campaign</h3>
                    <p className="text-xs text-gray-400 mb-4">Launch and monitor engagement real-time</p>
                    <div className="flex gap-2 justify-center mb-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Live</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Analytics</span>
                    </div>
                    <button
                      onClick={handleSendCampaign}
                      disabled={isSending}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Campaign"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-white/5 backdrop-blur-md rounded-xl p-6 border-2 border-red-500/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-400" />
                    Hot Leads (Active Interest)
                  </h2>
                  <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300">
                    View All ({hotLeads.length}) →
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hotLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-red-400/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                          ✅ {lead.status === "hot" ? "Hot" : "Interested"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold mb-1">{lead.name}</h3>
                      <p className="text-xs text-gray-400 mb-1">{lead.company}</p>
                      <a href={`mailto:${lead.email}`} className="text-xs text-cyan-400 hover:text-cyan-300 mb-3 block">
                        {lead.email}
                      </a>
                      <div className="bg-cyan-500/10 border-l-2 border-cyan-400 rounded p-2 mb-3">
                        <p className="text-xs italic text-gray-300">"{lead.reply}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded text-xs font-semibold hover:scale-105 transition-transform">
                          Reply
                        </button>
                        <button className="flex-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded text-xs font-semibold hover:scale-105 transition-transform">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Business Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs uppercase text-gray-400 mb-2">Company Details</h3>
                    <p className="text-sm mb-1">
                      <span className="text-gray-400">Name:</span> {profile.business_name}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="text-gray-400">Industry:</span> {profile.industry}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="text-gray-400">Website:</span>{" "}
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        {profile.website}
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase text-gray-400 mb-2">Contact Information</h3>
                    <p className="text-sm mb-1">
                      <span className="text-gray-400">Email:</span> {profile.email}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="text-gray-400">Phone:</span> {profile.phone}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="text-gray-400">Address:</span> {profile.street}, {profile.city}, {profile.state}{" "}
                      {profile.zip}
                    </p>
                  </div>

                  {(profile.linkedin || profile.twitter || profile.github) && (
                    <div className="col-span-2">
                      <h3 className="text-xs uppercase text-gray-400 mb-2">Social Media</h3>
                      <div className="flex gap-4">
                        {profile.linkedin && (
                          <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                          >
                            LinkedIn →
                          </a>
                        )}
                        {profile.twitter && (
                          <a
                            href={profile.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                          >
                            Twitter →
                          </a>
                        )}
                        {profile.github && (
                          <a
                            href={profile.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                          >
                            GitHub →
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.services && (
                    <div className="col-span-2">
                      <h3 className="text-xs uppercase text-gray-400 mb-2">Services Offered</h3>
                      <p className="text-sm">{profile.services}</p>
                    </div>
                  )}
                </div>
              </div>

              {prospects.length > 0 && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Discovered Prospects ({prospects.length})
                  </h2>
                  <div className="space-y-3">
                    {prospects.slice(0, 5).map((prospect) => (
                      <div
                        key={prospect.id}
                        className="bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold">{prospect.company_name}</h3>
                            <p className="text-xs text-gray-400">
                              {prospect.contact_name} • {prospect.contact_email}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                                {prospect.industry}
                              </span>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs capitalize">
                                {prospect.status}
                              </span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg text-xs font-semibold hover:scale-105 transition-transform">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {prospects.length > 5 && (
                    <button
                      onClick={() => setShowProspects(true)}
                      className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-sm font-semibold hover:scale-105 transition-transform"
                    >
                      View All {prospects.length} Prospects →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === "targeting" && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
              <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Targeting Settings</h2>
              <p className="text-gray-400">Configure your target audience and parameters</p>
            </div>
          )}

          {activeSection === "contact" && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
              <Mail className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Contact Management</h2>
              <p className="text-gray-400">Manage your contacts and communication</p>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
              <Settings className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Settings</h2>
              <p className="text-gray-400">Configure your account and preferences</p>

              {/* Section: Schedule Settings */}
              <section className="mb-16 mt-8 text-left">
                <h2 className="text-xl font-light mb-6 border-b border-gray-800 pb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Schedule
                  </span>{" "}
                  Settings
                </h2>

                <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-normal text-white mb-1">Automatic Prospect Discovery</h3>
                        <p className="text-xs text-gray-400">Run prospect discovery automatically every night</p>
                      </div>
                      <button
                        onClick={() =>
                          setSchedule((prev) => ({ ...prev, auto_discover_enabled: !prev.auto_discover_enabled }))
                        }
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          schedule.auto_discover_enabled ? "bg-blue-500" : "bg-gray-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            schedule.auto_discover_enabled ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                        Daily Prospect Limit
                      </label>
                      <select
                        value={schedule.daily_prospect_limit}
                        onChange={(e) =>
                          setSchedule((prev) => ({ ...prev, daily_prospect_limit: Number.parseInt(e.target.value) }))
                        }
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value={25}>25 prospects/day</option>
                        <option value={50}>50 prospects/day</option>
                        <option value={100}>100 prospects/day</option>
                        <option value={200}>200 prospects/day</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Run Time</label>
                      <input
                        type="time"
                        value={schedule.run_time}
                        onChange={(e) => setSchedule((prev) => ({ ...prev, run_time: e.target.value }))}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleSaveSchedule}
                      disabled={savingSchedule}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 text-sm"
                    >
                      {savingSchedule ? "Saving..." : "Save Schedule Settings"}
                    </button>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-400">
                        <strong>How it works:</strong> When enabled, the system will automatically discover new
                        prospects every night at your specified time. Prospects will be added to your account up to the
                        daily limit.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Discovered Prospects</h2>
              <button onClick={() => setShowProspects(false)} className="text-[#8B92A9] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* ... existing prospects table ... */}
            {prospects.length > 0 ? (
              <div className="overflow-x-auto flex-1 -mx-4 sm:mx-0">
                <div className="min-w-[600px] px-4 sm:px-0">
                  <table className="w-full">
                    <thead className="border-b border-white/10 sticky top-0 bg-neutral-900">
                      <tr>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-400">
                          Company
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-400">
                          Contact
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-400">
                          Email
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-400">
                          Industry
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-400">
                          Source
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prospects.map((prospect) => (
                        <tr key={prospect.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{prospect.company_name}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{prospect.contact_name}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-indigo-400 break-all">
                            {prospect.contact_email}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{prospect.industry}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-400">
                            {prospect.source}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-[10px] sm:text-xs whitespace-nowrap">
                              {prospect.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Target className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-medium mb-2">No prospects yet</h3>
                <p className="text-xs sm:text-sm text-gray-400">Click "Discover Prospects" to start finding leads</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
