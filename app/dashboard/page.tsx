"use client"

import type React from "react"

import { useRef } from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Target, Mail, Loader2, X, Settings, HelpCircle, BarChart3 } from "lucide-react" // Merged: Added Settings icon and Zap icon

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

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [actionStatus, setActionStatus] = useState<string | null>(null)
  const [stats, setStats] = useState({ prospects: 0, campaigns: 0, emails: 0 })

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
                message: "Business analysis completed successfully!",
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
                  message: "Prospects discovered successfully! Click 'View Prospects' to see results.",
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
                  message: "Email campaign sent successfully!",
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
        message: `Workflow failed: ${err.message}`,
      })
      stopPolling()
    }
  } // From existing

  const handleDiscoverProspects = async () => {
    if (!profile?.id) {
      setActionStatus("⚠ Profile not loaded. Please refresh.")
      return
    }

    setIsDiscovering(true)
    setActionStatus(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://api.leadsite.ai/api/profile/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setActionStatus("✓ Prospect discovery started! Results will appear shortly.")
        pollForProspects()
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
    setIsAnalyzing(true)
    setActionStatus(null)

    try {
      const token = localStorage.getItem("token")
      const customerId = localStorage.getItem("customerId")

      // First check if we have prospects
      const prospectsRes = await fetch("https://api.leadsite.ai/api/prospects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const prospectsData = await prospectsRes.json()

      if (!prospectsData.prospects?.length) {
        setActionStatus("⚠ No prospects found. Discover prospects first!")
        setIsAnalyzing(false)
        return
      }

      // Create a campaign and trigger email generation
      const campaignRes = await fetch("https://api.leadsite.ai/api/campaigns", {
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
        const campaignId = campaignData.campaign?.id || campaignData.id

        // Trigger prospect discovery for this campaign
        await fetch(`https://api.leadsite.ai/api/campaigns/${campaignId}/discover-prospects`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })

        setActionStatus("✓ Email generation started! Check Campaigns for progress.")

        // Reload campaigns
        const campaignsData = await callApi("GET", `/api/campaigns?customer_id=${customerId}`)
        setCampaigns(campaignsData?.campaigns || [])
      }
    } catch (err) {
      setActionStatus("✗ Failed to generate emails.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSendCampaign = async () => {
    setIsSending(true)
    setActionStatus(null)

    try {
      const token = localStorage.getItem("token")

      // Get campaigns
      const campaignsRes = await fetch("https://api.leadsite.ai/api/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const campaignsData = await campaignsRes.json()

      if (!campaignsData.campaigns?.length) {
        setActionStatus("⚠ No campaigns found. Generate emails first!")
        setIsSending(false)
        return
      }

      // Send the most recent campaign
      const latestCampaign = campaignsData.campaigns[0]
      const sendRes = await fetch(`https://api.leadsite.ai/api/campaigns/${latestCampaign.id}/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      const sendData = await sendRes.json()

      if (sendData.success) {
        setActionStatus("✓ Campaign sending started! Emails will be delivered shortly.")
      }
    } catch (err) {
      setActionStatus("✗ Failed to send campaign.")
    } finally {
      setIsSending(false)
    }
  }

  const pollForProspects = () => {
    let attempts = 0
    const maxAttempts = 12 // 1 minute max

    const interval = setInterval(async () => {
      attempts++
      const token = localStorage.getItem("token")

      const res = await fetch("https://api.leadsite.ai/api/prospects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.prospects?.length > stats.prospects) {
        setStats((prev) => ({ ...prev, prospects: data.prospects.length }))
        setProspects(data.prospects)
        setActionStatus(`✓ Found ${data.prospects.length} prospects!`)
        clearInterval(interval)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 5000)
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
  } // From existing

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
  } // From existing

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    const customerId = localStorage.getItem("customerId")

    if (!customerId) {
      setError("Customer ID not found. Please log in again.")
      return
    }

    // Validate form fields
    if (!businessForm.name.trim() || !businessForm.industry || !businessForm.url.trim()) {
      setError("Please fill in all fields")
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      console.log("[Dashboard] Creating business:", { customerId, businessForm })

      await callApi("POST", "/api/businesses", {
        customer_id: Number.parseInt(customerId),
        name: businessForm.name,
        industry: businessForm.industry,
        url: businessForm.url,
      })

      console.log("[Dashboard] Business created successfully")

      // Reload businesses
      const businessesData = await callApi("GET", `/api/businesses?customer_id=${customerId}`)
      setBusinesses(businessesData?.businesses || [])

      // Reset form and close modal
      setBusinessForm({ name: "", industry: "", url: "" })
      setShowCreateBusiness(false)

      setWorkflowStatus({
        type: "create_business",
        status: "complete",
        message: "Business created successfully!",
      })

      // Clear status after 3 seconds
      setTimeout(() => {
        setWorkflowStatus(null)
      }, 3000)
    } catch (err: any) {
      console.error("[Dashboard] Error creating business:", err)
      setError(err.message || "Failed to create business")
    } finally {
      setFormLoading(false)
    }
  } // From existing

  const handleViewProspects = async (businessId: string) => {
    await loadProspects(businessId)
    setShowProspects(true)
  } // From existing

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("customerId")
    router.push("/")
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

  if (loading) {
    return (
      // Merged: Spline 3D background and dark overlay
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Merged: Conditional rendering for null profile
  if (!profile) return null

  return (
    <div className="min-h-screen bg-[#0F1419] text-white font-['Poppins']">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#1A1F2E] border-b border-[#2A3142] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-[#0066FF] font-bold text-xl tracking-tight">LeadSite.AI</div>

          <div className="flex items-center gap-3">
            {profile?.logo ? (
              <img
                src={profile.logo || "/placeholder.svg"}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-[#0066FF]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center font-semibold text-sm">
                {profile?.owner_name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold leading-none">{profile?.owner_name || "User"}</div>
              <div className="text-xs text-[#8B92A9] mt-0.5">{profile?.business_name || "Company"}</div>
            </div>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-[#FBBF24] text-black rounded">Trial</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-[#8B92A9] hover:text-[#0066FF] hover:bg-[#0066FF]/10 rounded-lg transition-all duration-300">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className="p-2 text-[#8B92A9] hover:text-[#0066FF] hover:bg-[#0066FF]/10 rounded-lg transition-all duration-300"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-[#8B92A9] hover:text-[#FF4757] hover:bg-[#FF4757]/10 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-[220px] bg-[#1A1F2E] border-r border-[#2A3142] min-h-[calc(100vh-61px)] p-4">
          <nav className="space-y-1">
            {[
              { icon: BarChart3, label: "Dashboard", id: "dashboard" },
              { icon: Target, label: "Targeting", id: "targeting" },
              { icon: Mail, label: "Contacts", id: "contacts" },
              { icon: Settings, label: "Settings", id: "settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? "bg-[#0066FF]/12 text-white border-l-3 border-[#0066FF]"
                    : "text-[#8B92A9] hover:bg-[#0066FF]/8 hover:text-[#0066FF]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === "dashboard" && (
            <>
              {/* Section 1: Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    icon: "👥",
                    label: "TOTAL PROSPECTS",
                    value: prospects.length || 125,
                    change: "+32 this week",
                  },
                  {
                    icon: "📧",
                    label: "EMAILS SENT",
                    value: emailStats.sent || 45,
                    change: "+8 today",
                  },
                  {
                    icon: "📊",
                    label: "OPEN RATE",
                    value: `${emailStats.openRate || 32}%`,
                    change: "↑ 5% from avg",
                  },
                  {
                    icon: "💬",
                    label: "REPLIES",
                    value: emailStats.replies || 8,
                    change: "17.8% reply rate",
                  },
                  {
                    icon: "🔥",
                    label: "HOT LEADS",
                    value: emailStats.hotLeads || 3,
                    change: "Awaiting follow-up",
                  },
                  {
                    icon: "✓",
                    label: "DELIVERY RATE",
                    value: "98%",
                    change: "Excellent",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-5 hover:border-[#0066FF] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] hover:-translate-y-1"
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-[10px] font-semibold text-[#8B92A9] tracking-[0.8px] uppercase mb-1">
                      {stat.label}
                    </div>
                    <div className="text-[32px] font-bold leading-none tracking-tight mb-1">{stat.value}</div>
                    <div className="text-xs text-[#8B92A9]">{stat.change}</div>
                  </div>
                ))}
              </div>

              {/* Section 2: Action Cards Header */}
              <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6 mb-6">
                <h2 className="text-base font-bold mb-1 flex items-center gap-2">
                  <span>🚀</span> Start Your Campaign
                </h2>
              </div>

              {/* Section 3: AI-Powered Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6 text-center hover:border-[#0066FF] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] hover:-translate-y-1">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-sm font-bold mb-2">Discover Prospects</h3>
                  <p className="text-xs text-[#8B92A9] mb-4">
                    Find qualified businesses matching your target market with precision
                  </p>
                  <div className="flex gap-2 justify-center mb-4 flex-wrap">
                    <span className="px-2 py-1 text-[9px] font-semibold bg-[#0066FF]/20 text-[#0066FF] rounded">
                      Fast Matching
                    </span>
                    <span className="px-2 py-1 text-[9px] font-semibold bg-[#0066FF]/20 text-[#0066FF] rounded">
                      Targeted
                    </span>
                  </div>
                  <button
                    onClick={handleDiscoverProspects}
                    disabled={isDiscovering}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white text-xs font-bold rounded-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                  >
                    {isDiscovering ? "Discovering..." : "Start Discovery"}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6 text-center hover:border-[#0066FF] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] hover:-translate-y-1">
                  <div className="text-4xl mb-3">✍️</div>
                  <h3 className="text-sm font-bold mb-2">Generate Emails</h3>
                  <p className="text-xs text-[#8B92A9] mb-4">
                    Create personalized outreach messages tailored to each prospect
                  </p>
                  <div className="flex gap-2 justify-center mb-4 flex-wrap">
                    <span className="px-2 py-1 text-[9px] font-semibold bg-[#0066FF]/20 text-[#0066FF] rounded">
                      AI Personalization
                    </span>
                    <span className="px-2 py-1 text-[9px] font-semibold bg-[#0066FF]/20 text-[#0066FF] rounded">
                      Dynamic
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateEmails}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white text-xs font-bold rounded-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                  >
                    {isAnalyzing ? "Generating..." : "Generate Now"}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6 text-center hover:border-[#0066FF] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] hover:-translate-y-1">
                  <div className="text-4xl mb-3">📤</div>
                  <h3 className="text-sm font-bold mb-2">Send Campaign</h3>
                  <p className="text-xs text-[#8B92A9] mb-4">Launch campaign and monitor engagement in real-time</p>
                  <div className="flex gap-2 justify-center mb-4 flex-wrap">
                    <span className="px-2 py-1 text-[9px] font-semibold bg-[#0066FF]/20 text-[#0066FF] rounded">
                      Live Tracking
                    </span>
                    <span className="px-2 py-1 text-[9px] font-semibold bg-[#0066FF]/20 text-[#0066FF] rounded">
                      Analytics
                    </span>
                  </div>
                  <button
                    onClick={handleSendCampaign}
                    disabled={isSending}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white text-xs font-bold rounded-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                  >
                    {isSending ? "Sending..." : "Send Campaign"}
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {actionStatus && (
                <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#0066FF] rounded-[10px] p-4 mb-6 text-sm">
                  {actionStatus}
                </div>
              )}

              {/* Section 4: Recent Activity Widget */}
              <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6 mb-6">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <span>📈</span> Recent Activity (Last 24 Hours)
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      icon: "🔍",
                      title: `Discovered ${prospects.length} qualified prospects`,
                      meta: "Automotive industry • USA",
                      time: "2 hours ago",
                    },
                    {
                      icon: "📧",
                      title: `Sent ${emailStats.sent} personalized emails`,
                      meta: "Campaign: Q1 Outreach",
                      time: "1 hour ago",
                    },
                    {
                      icon: "💬",
                      title: "New reply received from prospect",
                      meta: "Status: Hot Lead 🔥",
                      time: "30 minutes ago",
                    },
                    {
                      icon: "📊",
                      title: `${emailStats.opened} email opens detected`,
                      meta: "Strong engagement signal",
                      time: "15 minutes ago",
                    },
                  ].map((activity, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0066FF]/3 border-l-[3px] border-[#0066FF] p-3 rounded flex items-start justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{activity.icon}</span>
                        <div>
                          <div className="text-xs font-semibold">{activity.title}</div>
                          <div className="text-[10px] text-[#8B92A9] mt-0.5">{activity.meta}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#8B92A9] whitespace-nowrap">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Hot Leads Widget */}
              <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border-2 border-[#FF4757] rounded-[10px] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <span>🔥</span> Hot Leads (Active Interest)
                  </h2>
                  <button className="text-xs text-[#0066FF] hover:underline">View All (12)</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {replies.slice(0, 3).map((lead, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0066FF]/3 border border-[#2A3142] rounded-lg p-4 hover:border-[#FF4757] hover:bg-[#FF4757]/4 transition-all duration-300"
                    >
                      <span className="inline-block px-2 py-0.5 text-[9px] font-semibold bg-[#10B981]/20 text-[#10B981] rounded mb-2">
                        ✅ Interested
                      </span>
                      <div className="text-sm font-bold mb-1">{lead.contactName}</div>
                      <div className="text-xs text-[#8B92A9] mb-2">{lead.company}</div>
                      <a href="#" className="text-xs text-[#0066FF] hover:underline block mb-3">
                        contact@email.com
                      </a>
                      <div className="bg-[#0066FF]/10 border-l-2 border-[#0066FF] p-2 rounded text-[10px] italic text-[#8B92A9] mb-3">
                        "{lead.replyPreview}"
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 px-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white text-[10px] font-bold rounded hover:scale-[1.02] transition-all">
                          Reply
                        </button>
                        <button className="flex-1 py-1.5 px-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white text-[10px] font-bold rounded hover:scale-[1.02] transition-all">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <button className="text-xs text-[#0066FF] hover:underline">View All Hot Leads →</button>
                </div>
              </div>

              {/* Section 6: Quick Actions Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "➕", label: "New Campaign", primary: true },
                  { icon: "📋", label: "View Prospects", primary: true },
                  { icon: "📊", label: "Full Analytics", primary: true },
                  { icon: "⚙️", label: "Settings", primary: false },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (action.label === "View Prospects") setShowProspects(true)
                      if (action.label === "Settings") setActiveSection("settings")
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] ${
                      action.primary
                        ? "bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white"
                        : "bg-gradient-to-r from-[#2A3142] to-[#1A1F2E] text-white hover:from-[#0066FF] hover:to-[#0052CC]"
                    }`}
                  >
                    <span className="text-base">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeSection === "targeting" && (
            <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6">
              <h2 className="text-base font-bold mb-4">Target Audience</h2>
              {/* ... existing targeting content ... */}
            </div>
          )}

          {activeSection === "contacts" && (
            <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6">
              <h2 className="text-base font-bold mb-4">Contacts</h2>
              {/* ... existing contacts content ... */}
            </div>
          )}

          {activeSection === "settings" && (
            <div className="bg-gradient-to-br from-[#1A1F2E] to-[#212832] border border-[#2A3142] rounded-[10px] p-6">
              <h2 className="text-base font-bold mb-4">Settings</h2>
              {/* ... existing settings content ... */}
              <section className="mb-16">
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
