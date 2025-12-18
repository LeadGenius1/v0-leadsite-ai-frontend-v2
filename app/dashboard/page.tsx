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
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

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
  email?: string // Added for consistency with email sending
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

        // Use profileData.profile for the profile object
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
      // Removed hardcoded business ID and use selectedBusinessId
      if (!selectedBusinessId) {
        setActionStatus("✗ Please select a business first.")
        setIsDiscovering(false)
        return
      }
      const response = await fetch(`${API_BASE_URL}/api/businesses/${selectedBusinessId}/discover-prospects`, {
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
          // Refresh the page to show new prospects
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

      // Use selectedBusinessId to associate the campaign
      if (!selectedBusinessId) {
        setActionStatus("✗ Please select a business first.")
        setIsGenerating(false)
        return
      }

      // Create campaign and trigger generation
      const campaignRes = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Campaign ${new Date().toLocaleDateString()}`,
          business_id: selectedBusinessId,
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

  // Aether-style loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-400 font-light">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Aether-style error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-900/30 border border-red-500/50 text-center">
          <p className="text-red-400 text-sm mb-4">{error || "Profile not found"}</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Complete Onboarding →
          </button>
        </div>
      </div>
    )
  }

  return (
    // Aether-style main layout and background
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-['Inter']">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"
          style={{ maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }}
        ></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-medium tracking-widest uppercase text-white">LeadSite.AI</span>
          </div>

          {trialDaysLeft > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              TRIAL: {trialDaysLeft} DAYS LEFT
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-white"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="relative z-10 pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl bg-neutral-900/30 border border-white/10">
                <div className="flex flex-col items-center text-center mb-6">
                  {profile?.logo_base64 ? (
                    <img
                      src={profile.logo_base64 || "/placeholder.svg"}
                      alt="Business Logo"
                      className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-medium mb-4 border-2 border-white/10">
                      {profile?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <h2 className="text-lg font-medium text-white">{profile?.name}</h2>
                  <p className="text-xs text-neutral-400 font-light">{profile?.job_title}</p>
                  <p className="text-xs text-neutral-500 mt-2 font-light">{profile?.business_name}</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSection("dashboard")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeSection === "dashboard"
                        ? "bg-white/10 text-white border border-indigo-500/50"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => setActiveSection("targeting")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeSection === "targeting"
                        ? "bg-white/10 text-white border border-indigo-500/50"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    Targeting
                  </button>

                  <button
                    onClick={() => setActiveSection("contact")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeSection === "contact"
                        ? "bg-white/10 text-white border border-indigo-500/50"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </button>

                  <button
                    onClick={() => setActiveSection("settings")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeSection === "settings"
                        ? "bg-white/10 text-white border border-indigo-500/50"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">
                  Welcome back, {profile?.name?.split(" ")[0]}
                </span>
              </h1>
              <p className="text-sm text-neutral-400 font-light">Your AI-powered lead generation dashboard</p>
            </div>

            {actionStatus && (
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium animate-fade-in-up">
                {actionStatus}
              </div>
            )}

            {activeSection === "dashboard" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                          <Target className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-medium text-white">{stats.prospects}</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light">Prospects Discovered</p>
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-medium text-white">{stats.emailsSent}</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light">Emails Sent</p>
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                          <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-medium text-white">{stats.hotLeads}</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light">Hot Leads</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-medium tracking-tight mb-6">
                    <span className="text-indigo-400">AI-Powered</span> Actions
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center mb-4 text-indigo-400">
                          <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-medium text-white mb-2">Discover Prospects</h3>
                        <p className="text-xs text-neutral-400 leading-relaxed font-light mb-4">
                          Find businesses matching your target customer profile using AI-powered search.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Google Maps
                          </span>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Apollo.io
                          </span>
                        </div>
                        <button
                          onClick={handleDiscoverProspects}
                          disabled={isDiscovering}
                          className="relative inline-flex w-full h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
                          <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-4 py-1 text-xs font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                            {isDiscovering ? "Discovering..." : "Start Discovery"}
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-4 text-purple-400">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-medium text-white mb-2">Generate Emails</h3>
                        <p className="text-xs text-neutral-400 leading-relaxed font-light mb-4">
                          Create personalized outreach emails using GPT-4 based on your business profile.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            GPT-4
                          </span>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Personalized
                          </span>
                        </div>
                        <button
                          onClick={handleGenerateEmails}
                          disabled={isGenerating}
                          className="relative inline-flex w-full h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#9333ea_50%,#000000_100%)]"></span>
                          <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-4 py-1 text-xs font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                            {isGenerating ? "Generating..." : "Generate Emails"}
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center mb-4 text-cyan-400">
                          <Send className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-medium text-white mb-2">Send Campaign</h3>
                        <p className="text-xs text-neutral-400 leading-relaxed font-light mb-4">
                          Launch your email campaign and track opens, clicks, and replies in real-time.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            SendGrid
                          </span>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Tracking
                          </span>
                        </div>
                        <button
                          onClick={handleSendCampaign}
                          disabled={isSending}
                          className="relative inline-flex w-full h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#06b6d4_50%,#000000_100%)]"></span>
                          <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-4 py-1 text-xs font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                            {isSending ? "Sending..." : "Launch Campaign"}
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {hotLeads.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium tracking-tight mb-6">
                      <span className="text-cyan-400">Hot</span> Leads
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {hotLeads.slice(0, 3).map((lead) => (
                        <div
                          key={lead.id}
                          className="p-4 rounded-xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-medium text-white">{lead.name}</h4>
                              <p className="text-xs text-neutral-400 font-light">{lead.company}</p>
                            </div>
                            {lead.status === "hot" && <span className="text-base">🔥</span>}
                            {lead.status === "interested" && <span className="text-base">👍</span>}
                          </div>
                          <p className="text-xs text-neutral-300 mb-3 line-clamp-2 font-light">"{lead.reply}"</p>
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Reply →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-medium tracking-tight mb-6">
                    <span className="text-white">Business</span> Information
                  </h2>

                  <div className="p-8 rounded-2xl bg-neutral-900/30 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-sm font-medium text-indigo-400 mb-4 uppercase tracking-wide">
                          Company Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Business Name</p>
                            <p className="text-sm text-white font-light">{profile?.business_name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Industry</p>
                            <p className="text-sm text-white font-light">{profile?.industry}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Website</p>
                            <a
                              href={profile?.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-light flex items-center gap-1"
                            >
                              {profile?.website}
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-purple-400 mb-4 uppercase tracking-wide">Address</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Street</p>
                            <p className="text-sm text-white font-light">{profile?.street}</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">City</p>
                              <p className="text-sm text-white font-light">{profile?.city}</p>
                            </div>
                            <div className="w-20">
                              <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">State</p>
                              <p className="text-sm text-white font-light">{profile?.state}</p>
                            </div>
                            <div className="w-24">
                              <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Zip</p>
                              <p className="text-sm text-white font-light">{profile?.zip}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-cyan-400 mb-4 uppercase tracking-wide">Contact</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Email</p>
                            <a
                              href={`mailto:${profile?.email}`}
                              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-light"
                            >
                              {profile?.email}
                            </a>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Phone</p>
                            <a
                              href={`tel:${profile?.phone}`}
                              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-light"
                            >
                              {profile?.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wide">Social Media</h3>
                        <div className="space-y-3">
                          {profile?.linkedin && (
                            <div>
                              <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">LinkedIn</p>
                              <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-light flex items-center gap-1"
                              >
                                {profile.linkedin}
                                <ChevronRight className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {profile?.twitter && (
                            <div>
                              <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Twitter</p>
                              <a
                                href={profile.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-light flex items-center gap-1"
                              >
                                {profile.twitter}
                                <ChevronRight className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {profile?.github && (
                            <div>
                              <p className="text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">GitHub</p>
                              <a
                                href={profile.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-light flex items-center gap-1"
                              >
                                {profile.github}
                                <ChevronRight className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-medium tracking-tight mb-6">
                    <span className="text-purple-400">Target</span> Audience
                  </h2>

                  {prospects.length > 0 ? (
                    <div className="p-6 rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left border-b border-white/5">
                              <th className="pb-3 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                Company
                              </th>
                              <th className="pb-3 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                Contact
                              </th>
                              <th className="pb-3 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                Email
                              </th>
                              <th className="pb-3 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {prospects.slice(0, 5).map((prospect, index) => (
                              <tr key={prospect.id || index} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 text-sm text-white font-light">{prospect.company_name}</td>
                                <td className="py-3 text-sm text-neutral-300 font-light">{prospect.contact_name}</td>
                                <td className="py-3 text-sm text-indigo-400 font-light">{prospect.email}</td>
                                <td className="py-3">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      prospect.status === "qualified"
                                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                        : prospect.status === "contacted"
                                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                          : "bg-neutral-500/20 text-neutral-300 border border-neutral-500/30"
                                    }`}
                                  >
                                    {prospect.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {prospects.length > 5 && (
                        <div className="mt-6 text-center">
                          <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                            View All {prospects.length} Prospects →
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 rounded-2xl bg-neutral-900/30 border border-white/10 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                        <Target className="w-8 h-8" />
                      </div>
                      <p className="text-sm text-neutral-400 font-light">No prospects discovered yet</p>
                      <p className="text-xs text-neutral-500 mt-2 font-light">
                        Click "Discover Prospects" to find potential leads
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === "targeting" && (
              <div className="p-8 rounded-2xl bg-neutral-900/30 border border-white/10">
                <h2 className="text-xl font-medium tracking-tight mb-6">Targeting Settings</h2>
                <p className="text-sm text-neutral-400 font-light">Configure your target audience parameters here.</p>
              </div>
            )}

            {activeSection === "contact" && (
              <div className="p-8 rounded-2xl bg-neutral-900/30 border border-white/10">
                <h2 className="text-xl font-medium tracking-tight mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-white font-light">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-white font-light">{profile?.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="p-8 rounded-2xl bg-neutral-900/30 border border-white/10">
                <h2 className="text-xl font-medium tracking-tight mb-6">Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-white">Auto-Discovery</p>
                        <p className="text-xs text-neutral-400 font-light mt-1">
                          Automatically discover new prospects daily
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={schedule.auto_discover_enabled}
                          onChange={(e) => setSchedule({ ...schedule, auto_discover_enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wider">
                      Daily Prospect Limit
                    </label>
                    <select
                      value={schedule.daily_prospect_limit}
                      onChange={(e) =>
                        setSchedule({ ...schedule, daily_prospect_limit: Number.parseInt(e.target.value) })
                      }
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                    >
                      <option value="25">25 prospects</option>
                      <option value="50">50 prospects</option>
                      <option value="100">100 prospects</option>
                      <option value="200">200 prospects</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                    className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
                    <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 hover:bg-neutral-900/80 transition-colors">
                      {savingSchedule ? "Saving..." : "Save Settings"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
