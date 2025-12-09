/**
 * API Client for LeadSite AI
 * Base URL: https://api.leadsite.ai
 */
const API_BASE_URL = "https://api.leadsite.ai"

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

/**
 * Base fetch wrapper with error handling
 */
async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  // Add default headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Client API methods
 */
export const api = {
  // Clients
  clients: {
    list: (params?: { page?: string; limit?: string; search?: string }) =>
      apiRequest<any>("/clients", { params }),
    get: (id: string) => apiRequest<any>(`/clients/${id}`),
    create: (data: any) =>
      apiRequest<any>("/clients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => apiRequest<any>(`/clients/${id}`, { method: "DELETE" }),
  },

  // Emails
  emails: {
    list: (params?: { page?: string; limit?: string; status?: string }) =>
      apiRequest<any>("/emails", { params }),
    get: (id: string) => apiRequest<any>(`/emails/${id}`),
    send: (data: any) =>
      apiRequest<any>("/emails/send", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    track: (id: string) => apiRequest<any>(`/emails/${id}/tracking`),
  },

  // Analytics
  analytics: {
    dashboard: () => apiRequest<any>("/analytics/dashboard"),
    performance: (params?: { start?: string; end?: string }) =>
      apiRequest<any>("/analytics/performance", { params }),
    reports: () => apiRequest<any>("/analytics/reports"),
  },

  // Settings
  settings: {
    get: () => apiRequest<any>("/settings"),
    update: (data: any) =>
      apiRequest<any>("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
}

export default api
