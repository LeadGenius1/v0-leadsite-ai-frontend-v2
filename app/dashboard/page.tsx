"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<any>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("session_token")
    
    if (!token) {
      router.push("/")
      return
    }

    fetchDashboardData(token)
  }, [])

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true)
      setError("")

      // Fetch overview
      const overviewRes = await fetch("https://api.leadsite.ai/api/dashboard/overview", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!overviewRes.ok) throw new Error("Failed to fetch overview")
      const overviewData = await overviewRes.json()
      setOverview(overviewData.data)

      // Fetch businesses
      const businessesRes = await fetch("https://api.leadsite.ai/api/dashboard/businesses", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!businessesRes.ok) throw new Error("Failed to fetch businesses")
      const businessesData = await businessesRes.json()
      setBusinesses(businessesData.data)

      // Fetch campaigns
      const campaignsRes = await fetch("https://api.leadsite.ai/api/dashboard/campaigns", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!campaignsRes.ok) throw new Error("Failed to fetch campaigns")
      const campaignsData = await campaignsRes.json()
      setCampaigns(campaignsData.data)

      setLoading(false)
    } catch (err: any) {
      console.error("Dashboard error:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("session_token")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full mr-3"></div>
            <h1 className="text-2xl font-bold text-gray-900">LeadSite.AI</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Businesses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalBusinesses || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Prospects</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalProspects || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Active Campaigns</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.activeCampaigns || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Emails</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalEmails || 0}</p>
          </div>
        </div>

        {/* Businesses Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Analyzed Businesses</h2>
          </div>
          <div className="p-6">
            {businesses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No businesses analyzed yet. Start by adding your first business!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Business Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Website</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Industry</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Prospects</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((business) => (
                      <tr key={business.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{business.name}</td>
                        <td className="py-3 px-4 text-blue-600">{business.website}</td>
                        <td className="py-3 px-4">{business.industry}</td>
                        <td className="py-3 px-4">{business.prospectCount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            business.status === 'completed' ? 'bg-green-100 text-green-800' :
                            business.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {business.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
          </div>
          <div className="p-6">
            {campaigns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No campaigns created yet. Launch your first campaign to start generating leads!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Campaign Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Emails Sent</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Opened</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Replied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{campaign.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{campaign.sentCount}</td>
                        <td className="py-3 px-4">{campaign.openedCount}</td>
                        <td className="py-3 px-4">{campaign.repliedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
