import { DashboardLayout } from "@/components/dashboard-layout"
import { EmailsTable } from "@/components/emails-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Search } from "lucide-react"

export default function EmailsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Tracking</h1>
            <p className="text-muted-foreground">Monitor email opens and engagement</p>
          </div>
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search emails..." className="pl-10" />
          </div>
        </div>

        <EmailsTable />
      </div>
    </DashboardLayout>
  )
}
