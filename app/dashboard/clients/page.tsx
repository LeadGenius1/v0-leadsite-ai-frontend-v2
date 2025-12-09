import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientsTable } from "@/components/clients-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

export default function ClientsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Manage and track all your leads</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-10" />
          </div>
        </div>

        <ClientsTable />
      </div>
    </DashboardLayout>
  )
}
