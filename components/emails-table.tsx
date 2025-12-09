import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, MousePointerClick } from "lucide-react"

const emails = [
  {
    id: 1,
    subject: "Q1 Business Proposal",
    recipient: "Sarah Chen",
    status: "Opened",
    opens: 3,
    clicks: 2,
    sent: "2 days ago",
  },
  {
    id: 2,
    subject: "Product Demo Invitation",
    recipient: "Marcus Rodriguez",
    status: "Sent",
    opens: 0,
    clicks: 0,
    sent: "5 days ago",
  },
  {
    id: 3,
    subject: "Follow-up: Design Consultation",
    recipient: "Emily Watson",
    status: "Opened",
    opens: 5,
    clicks: 3,
    sent: "1 day ago",
  },
  {
    id: 4,
    subject: "Partnership Opportunity",
    recipient: "David Kim",
    status: "Clicked",
    opens: 2,
    clicks: 1,
    sent: "3 days ago",
  },
  {
    id: 5,
    subject: "Enterprise Solutions Overview",
    recipient: "Lisa Anderson",
    status: "Sent",
    opens: 0,
    clicks: 0,
    sent: "1 week ago",
  },
]

export function EmailsTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-medium hidden md:table-cell">Recipient</th>
                <th className="px-6 py-4 text-left text-sm font-medium hidden lg:table-cell">Status</th>
                <th className="px-6 py-4 text-center text-sm font-medium hidden xl:table-cell">Opens</th>
                <th className="px-6 py-4 text-center text-sm font-medium hidden xl:table-cell">Clicks</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Sent</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email, index) => (
                <tr key={email.id} className={index !== emails.length - 1 ? "border-b" : ""}>
                  <td className="px-6 py-4">
                    <p className="font-medium">{email.subject}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-muted-foreground">{email.recipient}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <Badge
                      variant={
                        email.status === "Opened" ? "default" : email.status === "Clicked" ? "default" : "secondary"
                      }
                    >
                      {email.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center hidden xl:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{email.opens}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center hidden xl:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{email.clicks}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{email.sent}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
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
