import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, UserPlus, Target } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "email",
    title: "Email opened",
    description: "Sarah Chen opened your proposal",
    time: "5 min ago",
    icon: Mail,
  },
  {
    id: 2,
    type: "lead",
    title: "New lead",
    description: "Marcus Rodriguez added to pipeline",
    time: "12 min ago",
    icon: UserPlus,
  },
  {
    id: 3,
    type: "conversion",
    title: "Deal closed",
    description: "Tech Solutions Inc. - $15,000",
    time: "1 hour ago",
    icon: Target,
  },
  {
    id: 4,
    type: "email",
    title: "Email opened",
    description: "David Kim clicked link in email",
    time: "2 hours ago",
    icon: Mail,
  },
]

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <activity.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
