"use client"

import type React from "react"

import { useRef } from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Building2, Target, Mail, MapPin, Phone, Globe, Loader2, X } from "lucide-react"

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

      const response = await fetch(`https://api.leadsite.ai${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.JSON.stringify(body) : null,
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
      try {
        setLoading(true)

        // Merged: Fetch user data and profile data using callApi helper
        const userData = await callApi("GET", "/api/dashboard")
        if (!userData) return

        console.log("[Dashboard] Dashboard data loaded:", userData)
        setUser(userData)
        localStorage.setItem("customerId", userData.customerId)

        let profileData
        try {
          profileData = await callApi("GET", "/api/profile")
          console.log("[Dashboard] Profile data loaded:", profileData)
          setProfile(profileData?.profile)
        } catch (profileErr: any) {
          // If profile doesn't exist (404), redirect to onboarding
          if (profileErr.message.includes("404") || profileErr.message.includes("not found")) {
            console.log("[Dashboard] No profile found, redirecting to onboarding")
            router.push("/onboarding")
            return
          }
        }

        // Calculate trial days
        const trialEnd = new Date(userData.trial_ends_at)
        const today = new Date()
        const daysLeft = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        setTrialDaysLeft(Math.max(0, daysLeft))

        const businessFromProfile = profileData?.profile
          ? {
              id: profileData.profile.id,
              name: profileData.profile.business_name,
              industry: profileData.profile.industry,
              url: profileData.profile.website,
              customer_id: userData.customerId,
              analysis_status: profileData.profile.analysis_status || "pending",
              discovery_status: profileData.profile.discovery_status || "pending",
              created_at: profileData.profile.created_at,
            }
          : null

        console.log("[Dashboard] Business from profile:", businessFromProfile)

        const campaignsData = await callApi("GET", `/api/campaigns?customer_id=${userData.customerId}`)
        console.log("[Dashboard] Campaigns:", campaignsData)

        setBusinesses(businessFromProfile ? [businessFromProfile] : [])
        setCampaigns(campaignsData?.campaigns || [])
        setError(null)
      } catch (err: any) {
        console.error("[Dashboard] Dashboard load failed:", err)
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
  }, []) // From existing

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
                <a href="#business" className="flex items-center text-blue-400 py-2 px-3 rounded-md bg-blue-500/10">
                  <Building2 className="w-5 h-5 mr-3" />
                  Business Info
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

        <div className="w-full md:w-2/3 lg:w-3/4 p-6 md:p-10 overflow-y-auto">
          {/* Business Information Section */}
          <section id="business" className="mb-16">
            <h2 className="text-2xl font-light mb-6 border-b border-gray-800 pb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Business</span>{" "}
              Information
            </h2>

            <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Business Name</label>
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
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                    <p className="text-gray-300 text-sm">{profile.description}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Services Offered</label>
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Target</span>{" "}
              Audience
            </h2>

            <div className="backdrop-blur-lg bg-black/30 rounded-xl border border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Customer Type</label>
                  <p className="text-gray-200">{profile.target_customer_type}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Target Location</label>
                  <p className="text-gray-200">{profile.target_location}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="mb-16">
            <h2 className="text-2xl font-light mb-6 border-b border-gray-800 pb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">Contact</span>{" "}
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
