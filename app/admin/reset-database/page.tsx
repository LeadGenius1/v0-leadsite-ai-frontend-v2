"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function ResetDatabasePage() {
  const [isResetting, setIsResetting] = useState(false)
  const [result, setResult] = useState<string>("")
  const [confirmText, setConfirmText] = useState("")

  const handleReset = async () => {
    if (confirmText !== "DELETE ALL USERS") {
      setResult("Error: You must type 'DELETE ALL USERS' to confirm")
      return
    }

    setIsResetting(true)
    setResult("")

    try {
      const response = await fetch("/api/admin/reset-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Success: Deleted ${data.deletedCount} users. Database is now clean.`)
        setConfirmText("")
      } else {
        setResult(`❌ Error: ${data.error || "Failed to reset database"}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Network error"}`)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-900 border-red-500/50">
        <CardHeader>
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <AlertTriangle className="h-8 w-8" />
            <CardTitle className="text-2xl text-white">Database Reset - DANGER ZONE</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            This will permanently delete ALL users and related data from the database. This action CANNOT be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">⚠️ What will be deleted:</h3>
            <ul className="text-gray-300 space-y-1 list-disc list-inside">
              <li>All user accounts</li>
              <li>All user profiles and onboarding data</li>
              <li>All campaigns</li>
              <li>All prospects</li>
              <li>All email statistics</li>
            </ul>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              Type <span className="text-red-500 font-bold">DELETE ALL USERS</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Type here..."
            />
          </div>

          <Button
            onClick={handleReset}
            disabled={isResetting || confirmText !== "DELETE ALL USERS"}
            className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isResetting ? "Resetting Database..." : "🗑️ Reset Database - Delete All Users"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.startsWith("✅")
                  ? "bg-green-950/50 border border-green-500/50 text-green-400"
                  : "bg-red-950/50 border border-red-500/50 text-red-400"
              }`}
            >
              {result}
            </div>
          )}

          <div className="text-center">
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-white underline">
              ← Back to Dashboard
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
