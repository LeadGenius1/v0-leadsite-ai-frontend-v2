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
   * Get n8n status
   */
  getN8nStatus: async (): Promise<N8nStatusResponse> => {
    return apiFetch("/api/n8n/status")
  },
}

export default api
