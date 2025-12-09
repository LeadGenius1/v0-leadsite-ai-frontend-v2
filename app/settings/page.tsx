import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Acme Inc." />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailNotif">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about your campaigns</p>
              </div>
              <Switch id="emailNotif" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="openNotif">Email Open Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when contacts open emails</p>
              </div>
              <Switch id="openNotif" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weeklyReport">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
              </div>
              <Switch id="weeklyReport" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Connect to external services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API Endpoint</Label>
              <Input id="apiUrl" defaultValue="https://api.leadsite.ai" readOnly className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                defaultValue="sk_live_xxxxxxxxxxxxxxxxxx"
                readOnly
                className="font-mono text-sm"
              />
            </div>
            <Button variant="outline">Generate New Key</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
