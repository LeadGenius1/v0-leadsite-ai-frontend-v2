"use client"

import { useEffect, useState } from "react"
import { api, type DashboardOverview } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, MessageSquare, Target, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const overview = await api.getDashboardOverview()
        setData(overview)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center max-w-md">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome to your LeadSite.AI dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Total Prospects</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{data.totalProspects.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{data.totalEmails.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Replies</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{data.totalReplies.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{data.activeCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{data.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-white">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.campaignPerformance.map((campaign, index) => (
                  <div key={index} className="border-b border-zinc-800 last:border-0 pb-3 last:pb-0">
                    <h4 className="font-medium text-white text-sm mb-2">{campaign.name}</h4>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Open Rate</span>
                        <div className="font-semibold text-green-400">{campaign.openRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Click Rate</span>
                        <div className="font-semibold text-blue-400">{campaign.clickRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Reply Rate</span>
                        <div className="font-semibold text-purple-400">{campaign.replyRate}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 border-b border-zinc-800 last:border-0 pb-3 last:pb-0"
                  >
                    <div
                      className={`w-2 h-2 mt-1.5 rounded-full ${
                        activity.type === "email_sent"
                          ? "bg-green-500"
                          : activity.type === "reply_received"
                            ? "bg-blue-500"
                            : activity.type === "prospect_added"
                              ? "bg-purple-500"
                              : "bg-gray-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-300">{activity.description}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href="/dashboard/clients"
                className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
              >
                <Users className="h-4 w-4 mr-2" />
                View Prospects
              </a>
              <a
                href="/dashboard/emails"
                className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition"
              >
                <Mail className="h-4 w-4 mr-2" />
                View Emails
              </a>
              <a
                href="/settings"
                className="flex items-center justify-center px-3 py-2 bg-zinc-700 text-white text-xs rounded-lg hover:bg-zinc-600 transition"
              >
                <Target className="h-4 w-4 mr-2" />
                Settings
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
