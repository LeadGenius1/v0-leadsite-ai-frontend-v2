/**
 * LeadSite.AI Frontend API Client
 * Connects to backend at https://api.leadsite.ai
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Dashboard Overview Types
 */
export interface DashboardOverview {
  totalProspects: number
  totalEmails: number
  totalReplies: number
  activeCampaigns: number
  conversionRate: number
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
  campaignPerformance: Array<{
    name: string
    openRate: number
    clickRate: number
    replyRate: number
  }>
}

/**
 * Prospect Types
 */
export interface Prospect {
  id: number
  name: string
  email: string
  company?: string
  industry?: string
  status: "active" | "contacted" | "replied" | "converted"
  createdAt: Date | string
  lastContacted?: Date | string
}

export interface ProspectsResponse {
  prospects: Prospect[]
  total: number
  page?: number
  limit?: number
}

/**
 * Email Types
 */
export interface Email {
  id: number
  prospectId: number
  prospectName?: string
  subject: string
  body?: string
  sentAt: Date | string
  status: "sent" | "delivered" | "opened" | "replied" | "bounced"
  openedAt?: Date | string
  repliedAt?: Date | string
}

export interface EmailsResponse {
  emails: Email[]
  total: number
}

/**
 * Campaign Types
 */
export interface Campaign {
  id: number
  name: string
  status: "active" | "paused" | "completed"
  prospectsCount: number
  emailsSent: number
  openRate: number
  replyRate: number
  conversionRate: number
  createdAt: Date | string
  startDate?: Date | string
  endDate?: Date | string
}

export interface CampaignsResponse {
  campaigns: Campaign[]
}

/**
 * Business Types
 */
export interface Business {
  id: string
  name: string
  website: string
  industry: string
  description?: string
  status: string
  created_at: string
}

/**
 * n8n Workflow Types
 */
export interface N8nWorkflow {
  name: string
  status: "active" | "inactive"
  lastRun: string
  nextRun?: string
}

export interface N8nStatusResponse {
  status: "connected" | "disconnected"
  workflows: N8nWorkflow[]
}

/**
 * API Methods
 */
export const api = {
  /**
   * Test API connection
   */
  test: async (): Promise<{ message: string }> => {
    return apiFetch("/api/test")
  },

  /**
   * Get dashboard overview data
   */
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    return apiFetch("/api/dashboard/overview")
  },

  /**
   * Get prospects list
   */
  getProspects: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ProspectsResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set("page", params.page.toString())
    if (params?.limit) queryParams.set("limit", params.limit.toString())
    if (params?.status) queryParams.set("status", params.status)

    const query = queryParams.toString()
    const endpoint = query ? `/api/prospects?${query}` : "/api/prospects"

    return apiFetch(endpoint)
  },

  /**
   * Get emails list
   */
  getEmails: async (params?: {
    prospectId?: number
    status?: string
  }): Promise<EmailsResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.prospectId) queryParams.set("prospectId", params.prospectId.toString())
    if (params?.status) queryParams.set("status", params.status)

    const query = queryParams.toString()
    const endpoint = query ? `/api/emails?${query}` : "/api/emails"

    return apiFetch(endpoint)
  },

  /**
   * Get campaigns list
   */
  getCampaigns: async (): Promise<CampaignsResponse> => {
    return apiFetch("/api/campaigns")
  },

  /**
   * Get single business by ID
   */
  getBusiness: async (id: string, token: string): Promise<Business> => {
    return apiFetch(`/api/businesses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  /**
   * Update business
   */
  updateBusiness: async (
    id: string,
    data: { name: string; website: string; industry: string; description?: string },
    token: string,
  ): Promise<Business> => {
    return apiFetch(`/api/businesses/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete business
   */
  deleteBusiness: async (id: string, token: string): Promise<{ success: boolean }> => {
    return apiFetch(`/api/businesses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  /**
   * Create campaign
   */
  createCampaign: async (data: { name: string; business_id: string }, token: string): Promise<Campaign> => {
    return apiFetch("/api/campaigns", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  /**
   * Get prospects for a business
   */
  getProspectsByBusiness: async (businessId: string, token: string): Promise<ProspectsResponse> => {
    return apiFetch(`/api/prospects?business_id=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  /**
   * Get n8n status
   */
  getN8nStatus: async (): Promise<N8nStatusResponse> => {
    return apiFetch("/api/n8n/status")
  },

  /**
   * Get user dashboard data (email, plan_tier, trial_ends_at)
   */
  getUserDashboard: async (
    token: string,
  ): Promise<{
    customerId: string
    email: string
    plan_tier: string
    trial_ends_at: string
    created_at: string
  }> => {
    return apiFetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  /**
   * Get businesses for a customer
   */
  getBusinesses: async (
    customerId: string,
    token: string,
  ): Promise<{
    businesses: Array<{
      id: string
      customer_id: string
      name: string
      industry: string
      url: string
      analysis_status: string
      created_at: string
    }>
  }> => {
    return apiFetch(`/api/businesses?customer_id=${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  /**
   * Create new business
   */
  createBusiness: async (
    data: { customer_id: string; name: string; industry: string; url: string },
    token: string,
  ): Promise<{
    success: boolean
    businessId: string
    message: string
  }> => {
    return apiFetch("/api/businesses", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  /**
   * Get campaigns for a customer
   */
  getCampaignsByCustomer: async (
    customerId: string,
    token: string,
  ): Promise<{
    campaigns: Array<{
      id: string
      business_id: string
      name: string
      status: string
      created_at: string
    }>
  }> => {
    return apiFetch(`/api/campaigns?customer_id=${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  /**
   * Trigger N8N workflow
   */
  triggerWorkflow: async (
    data: {
      customer_id: string
      business_id: string
      workflow_type: "analyze_business" | "discover_prospects" | "generate_emails"
    },
    token: string,
  ): Promise<{
    received: boolean
    status: string
  }> => {
    return apiFetch("/api/workflows/trigger", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  /**
   * Get prospects for a business
   */
  getProspectsForBusiness: async (
    businessId: string,
    token: string,
  ): Promise<{
    prospects: Array<{
      id: number
      customer_id: string
      business_id: string
      company_name: string
      contact_name: string
      contact_email: string
      industry: string
      status: string
      source: string
    }>
  }> => {
    return apiFetch(`/api/prospects?business_id=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

/**
 * Add apiGet helper for standardized auth requests
 */
export async function apiGet<T>(path: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("leadsite_token") : null

  if (!token) {
    throw new Error("NO_TOKEN")
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  })

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED")
  }

  if (!res.ok) {
    throw new Error(`API_ERROR_${res.status}`)
  }

  return res.json()
}

/**
 * Add apiPost helper for standardized auth POST requests
 */
export async function apiPost<T>(path: string, body: object): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("leadsite_token") : null

  if (!token) {
    throw new Error("NO_TOKEN")
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  })

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED")
  }

  if (!res.ok) {
    throw new Error(`API_ERROR_${res.status}`)
  }

  return res.json()
}

export default api
