"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", leads: 245, emails: 1240 },
  { month: "Feb", leads: 289, emails: 1580 },
  { month: "Mar", leads: 324, emails: 1820 },
  { month: "Apr", leads: 398, emails: 2140 },
  { month: "May", leads: 445, emails: 2380 },
  { month: "Jun", leads: 512, emails: 2890 },
]

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Lead generation and email engagement over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="emails"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
