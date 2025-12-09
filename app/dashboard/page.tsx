import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { RecentActivity } from "@/components/recent-activity"
import { PerformanceChart } from "@/components/performance-chart"
import { Users, Mail, TrendingUp, Target } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your sales overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Clients" value="2,847" change="+12.5%" trend="up" icon={Users} />
          <StatsCard title="Email Opens" value="18,392" change="+8.2%" trend="up" icon={Mail} />
          <StatsCard title="Conversion Rate" value="24.8%" change="+3.1%" trend="up" icon={Target} />
          <StatsCard title="Revenue" value="$89,432" change="+15.3%" trend="up" icon={TrendingUp} />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
