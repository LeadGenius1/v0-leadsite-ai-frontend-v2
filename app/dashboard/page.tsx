"use client"

import type React from "react"

import { useRef } from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Building2,
  Target,
  Mail,
  MapPin,
  Phone,
  Globe,
  Loader2,
  X,
  Search,
  Sparkles,
  Send,
  Settings,
  Zap,
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
    setStats({
      prospects: prospects.length,
      campaigns: campaigns.length,
      emails: 0,
    })
  }, [prospects, campaigns])

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
    // Merged: Updated main container styling and background
    <div className="min-h-screen bg-black text-white font-light">
      <div className="fixed top-0 left-0 w-full h-full -z-20">
        <iframe
          src="https://my.spline.design/binarymaterialcopy-uzQoq9YUCPK8Sqz8n9uP5qMO/"
          frameBorder="0"
          width="100%"
          height="100%"
          title="3D Background"
        />
      </div>

      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-r from-black/85 to-black/70 -z-10" />

      <div className="flex flex-col md:flex-row min-h-screen relative z-10">
        <div className="w-full md:w-1/3 lg:w-1/4 bg-black/40 backdrop-blur-lg border-r border-gray-800 flex flex-col">
          {/* Profile Header */}
          <div className="p-6 flex flex-col items-center text-center border-b border-gray-800">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 border-2 border-blue-400">
              <span className="text-4xl font-semibold text-white">{profile.owner_name.charAt(0)}</span>
            </div>
            <h1 className="text-xl font-light mb-1">{profile.owner_name}</h1>
            <p className="text-blue-400 mb-3">{profile.business_name}</p>
            <p className="text-sm text-gray-400 mb-4">
              {profile.description || `${profile.industry} professional focused on ${profile.services}`}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">
                {user?.plan_tier || "Trial"}
              </span>
              {trialDaysLeft > 0 && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                  {trialDaysLeft} days left
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-6">
            <ul className="space-y-2">
              <li>
                <a
                  href="#dashboard"
                  onClick={() => setActiveSection("dashboard")} // Merged: onClick handler for active section
                  className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                    activeSection === "dashboard"
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#targeting"
                  className="flex items-center text-gray-400 hover:text-white py-2 px-3 rounded-md hover:bg-white/5 transition-colors"
                >
                  <Target className="w-5 h-5 mr-3" />
                  Targeting
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="flex items-center text-gray-400 hover:text-white py-2 px-3 rounded-md hover:bg-white/5 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#settings"
                  onClick={() => setActiveSection("settings")} // Merged: onClick handler for active section
                  className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                    activeSection === "settings"
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" /> {/* Merged: Settings icon */}
                  Settings
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact Info */}
          <div className="mt-auto p-6 border-t border-gray-800">
            <div className="text-sm text-gray-400 space-y-2">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {profile.city}, {profile.state}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {" "}
          {/* Merged: Changed from w-full md:w-2/3 lg:w-3/4 to flex-1 */}
          <div className="p-6 md:p-10 max-w-5xl">
            {" "}
            {/* Merged: Added max-w-5xl */}
            {activeSection === "dashboard" && (
              <>
                {/* Action Status Banner */}
                {actionStatus && (
                  <div
                    className={`mb-6 p-4 rounded-xl border ${
                      actionStatus.startsWith("✓")
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : actionStatus.startsWith("⚠")
                          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {actionStatus}
                  </div>
                )}

                <section className="mb-16">
                  <h2 className="text-2xl font-light mb-6 border-b border-gray-800 pb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                      AI-Powered
                    </span>{" "}
                    Actions
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Discover Prospects Card */}
                    <div
                      onClick={!isDiscovering ? handleDiscoverProspects : undefined}
                      className={`group cursor-pointer backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6 transition-all hover:-translate-y-1 ${
                        isDiscovering ? "opacity-50 cursor-wait" : "hover:border-blue-500/50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {isDiscovering ? (
                          <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Search className="w-7 h-7 text-blue-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-normal text-white mb-2">
                        {isDiscovering ? "Discovering..." : "Discover Prospects"}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Find businesses matching your target customer profile using AI-powered search.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Google Maps</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Apollo.io</span>
                      </div>
                    </div>

                    {/* Generate Emails Card */}
                    <div
                      onClick={!isAnalyzing ? handleGenerateEmails : undefined}
                      className={`group cursor-pointer backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6 transition-all hover:-translate-y-1 ${
                        isAnalyzing ? "opacity-50 cursor-wait" : "hover:border-purple-500/50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {isAnalyzing ? (
                          <div className="w-7 h-7 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Sparkles className="w-7 h-7 text-purple-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-normal text-white mb-2">
                        {isAnalyzing ? "Generating..." : "Generate Emails"}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Create personalized outreach emails using GPT-4 based on your business profile.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">GPT-4</span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Personalized</span>
                      </div>
                    </div>

                    {/* Send Campaign Card */}
                    <div
                      onClick={!isSending ? handleSendCampaign : undefined}
                      className={`group cursor-pointer backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6 transition-all hover:-translate-y-1 ${
                        isSending ? "opacity-50 cursor-wait" : "hover:border-cyan-500/50"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {isSending ? (
                          <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-7 h-7 text-cyan-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-normal text-white mb-2">
                        {isSending ? "Sending..." : "Send Campaign"}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Launch your email campaign and track opens, clicks, and replies in real-time.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">SendGrid</span>
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">Tracking</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Business Information Section */}
                <section id="business" className="mb-16">
                  <h2 className="text-2xl font-light mb-6 border-b border-gray-800 pb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                      Business
                    </span>{" "}
                    Information
                  </h2>

                  <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                          Business Name
                        </label>
                        <p className="text-gray-200">{profile.business_name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Industry</label>
                        <p className="text-gray-200">{profile.industry}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Website</label>
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4" />
                          {profile.website}
                        </a>
                      </div>
                      {profile.description && (
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                            Description
                          </label>
                          <p className="text-gray-300 text-sm">{profile.description}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                          Services Offered
                        </label>
                        <p className="text-gray-300 text-sm">{profile.services}</p>
                      </div>
                      {profile.unique_selling_points && (
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                            Unique Selling Points
                          </label>
                          <p className="text-gray-300 text-sm">{profile.unique_selling_points}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Targeting Section */}
                <section id="targeting" className="mb-16">
                  <h2 className="text-2xl font-light mb-6 border-b border-gray-800 pb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                      Target
                    </span>{" "}
                    Audience
                  </h2>

                  <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                          Customer Type
                        </label>
                        <p className="text-gray-200">{profile.target_customer_type}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                          Target Location
                        </label>
                        <p className="text-gray-200">{profile.target_location}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="mb-16">
                  <h2 className="text-2xl font-light mb-6 border-b border-gray-800 pb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
                      Contact
                    </span>{" "}
                    Details
                  </h2>

                  <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Full Address</label>
                        <p className="text-gray-200">{profile.address}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Email</label>
                        <p className="text-gray-200">{profile.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Phone</label>
                        <p className="text-gray-200">{profile.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Location</label>
                        <p className="text-gray-200">
                          {profile.city}, {profile.state} {profile.zip}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
            {activeSection === "settings" && (
              <section className="mb-10">
                <h2 className="text-2xl font-light mb-6 border-b border-gray-800 pb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    Auto-Discovery
                  </span>{" "}
                  Settings
                </h2>

                <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6">
                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
                    <div>
                      <h3 className="text-lg font-normal text-white mb-1">Nightly Prospect Discovery</h3>
                      <p className="text-gray-400 text-sm">Automatically find new prospects every night</p>
                    </div>
                    <button
                      onClick={() => setSchedule((s) => ({ ...s, auto_discover_enabled: !s.auto_discover_enabled }))}
                      className={`w-14 h-8 rounded-full transition-colors relative ${
                        schedule.auto_discover_enabled ? "bg-blue-500" : "bg-gray-700"
                      }`}
                    >
                      <div
                        className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
                          schedule.auto_discover_enabled ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Prospects Per Night */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Prospects per night</label>
                    <select
                      value={schedule.daily_prospect_limit}
                      onChange={(e) =>
                        setSchedule((s) => ({ ...s, daily_prospect_limit: Number.parseInt(e.target.value) }))
                      }
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value={25}>25 prospects</option>
                      <option value={50}>50 prospects</option>
                      <option value={100}>100 prospects</option>
                      <option value={200}>200 prospects (Premium)</option>
                    </select>
                    <p className="text-gray-500 text-xs mt-2">Free plan: 50/night • Pro plan: 200/night</p>
                  </div>

                  {/* Run Time */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Run at (EST)</label>
                    <select
                      value={schedule.run_time}
                      onChange={(e) => setSchedule((s) => ({ ...s, run_time: e.target.value }))}
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="00:00">12:00 AM (Midnight)</option>
                      <option value="01:00">1:00 AM</option>
                      <option value="02:00">2:00 AM</option>
                      <option value="03:00">3:00 AM</option>
                      <option value="04:00">4:00 AM</option>
                      <option value="05:00">5:00 AM</option>
                    </select>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-normal hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {savingSchedule ? "Saving..." : "Save Schedule Settings"}
                  </button>

                  {/* Info Box */}
                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-blue-400 font-normal mb-1">How it works</p>
                        <p className="text-gray-400 text-sm">
                          Our AI will search Google Maps and Apollo.io every night to find businesses matching your
                          target profile. New prospects appear in your dashboard each morning, ready for outreach.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-xl font-semibold">Prospects</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">{prospects.length} prospects discovered</p>
              </div>
              <button onClick={() => setShowProspects(false)}>
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {prospects.length > 0 ? (
              <div className="overflow-auto flex-1 -mx-4 sm:mx-0">
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
