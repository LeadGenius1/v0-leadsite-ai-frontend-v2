import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Mail, Phone } from "lucide-react"

const clients = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    company: "TechCorp",
    status: "Active",
    lastContact: "2 days ago",
    value: "$12,500",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    email: "marcus@innovate.io",
    company: "Innovate Labs",
    status: "Pending",
    lastContact: "5 days ago",
    value: "$8,200",
  },
  {
    id: 3,
    name: "Emily Watson",
    email: "emily.w@designstudio.com",
    company: "Design Studio",
    status: "Active",
    lastContact: "1 day ago",
    value: "$15,000",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david@startupventures.com",
    company: "Startup Ventures",
    status: "Active",
    lastContact: "3 days ago",
    value: "$22,800",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@globalenterprises.com",
    company: "Global Enterprises",
    status: "Inactive",
    lastContact: "2 weeks ago",
    value: "$5,600",
  },
]

export function ClientsTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium hidden md:table-cell">Company</th>
                <th className="px-6 py-4 text-left text-sm font-medium hidden lg:table-cell">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium hidden xl:table-cell">Last Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Value</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={client.id} className={index !== clients.length - 1 ? "border-b" : ""}>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm">{client.company}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <Badge
                      variant={
                        client.status === "Active" ? "default" : client.status === "Pending" ? "secondary" : "outline"
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden xl:table-cell">{client.lastContact}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{client.value}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
