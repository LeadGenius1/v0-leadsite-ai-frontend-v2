"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Target } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

// Company size options matching Instantly.ai API
const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1,000 employees" },
  { value: "1001-5000", label: "1,001-5,000 employees" },
  { value: "5001-10000", label: "5,001-10,000 employees" },
  { value: "10001+", label: "10,001+ employees" },
]

// Job level options matching Instantly.ai API
const JOB_LEVEL_OPTIONS = [
  { value: "C-Level", label: "C-Level (CEO, CFO, CTO, etc.)" },
  { value: "VP", label: "VP (Vice President)" },
  { value: "Director", label: "Director" },
  { value: "Manager", label: "Manager" },
  { value: "Senior", label: "Senior" },
  { value: "Entry", label: "Entry Level" },
]

// Customer type options
const CUSTOMER_TYPE_OPTIONS = [
  { value: "B2B", label: "B2B (Business to Business)" },
  { value: "B2C", label: "B2C (Business to Consumer)" },
  { value: "Both", label: "Both B2B and B2C" },
]

interface TargetingData {
  target_industries: string[]
  target_company_sizes: string[]
  target_job_titles: string[]
  target_job_levels: string[]
  target_location: string
  target_customer_type: string
}

export default function TargetingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [targeting, setTargeting] = useState<TargetingData>({
    target_industries: [],
    target_company_sizes: [],
    target_job_titles: [],
    target_job_levels: [],
    target_location: "",
    target_customer_type: "",
  })

  // For comma-separated input fields
  const [industriesInput, setIndustriesInput] = useState("")
  const [jobTitlesInput, setJobTitlesInput] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("leadsite_token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 401) {
          localStorage.clear()
          window.location.href = "/login"
          return
        }

        if (!res.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await res.json()

        // Map the response to targeting data
        const targetingData: TargetingData = {
          target_industries: data.targeting?.target_industries || [],
          target_company_sizes: data.targeting?.target_company_sizes || [],
          target_job_titles: data.targeting?.target_job_titles || [],
          target_job_levels: data.targeting?.target_job_levels || [],
          target_location: data.targeting?.target_location || "",
          target_customer_type: data.targeting?.target_customer_type || "",
        }

        setTargeting(targetingData)
        setIndustriesInput(targetingData.target_industries.join(", "))
        setJobTitlesInput(targetingData.target_job_titles.join(", "))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load targeting data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("leadsite_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      // Parse comma-separated inputs into arrays
      const targetingPayload = {
        ...targeting,
        target_industries: industriesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        target_job_titles: jobTitlesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(targetingPayload),
      })

      if (res.status === 401) {
        localStorage.clear()
        window.location.href = "/login"
        return
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to save targeting")
      }

      setSuccess("Targeting preferences saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save targeting")
    } finally {
      setSaving(false)
    }
  }

  const toggleCompanySize = (size: string) => {
    setTargeting((prev) => ({
      ...prev,
      target_company_sizes: prev.target_company_sizes.includes(size)
        ? prev.target_company_sizes.filter((s) => s !== size)
        : [...prev.target_company_sizes, size],
    }))
  }

  const toggleJobLevel = (level: string) => {
    setTargeting((prev) => ({
      ...prev,
      target_job_levels: prev.target_job_levels.includes(level)
        ? prev.target_job_levels.filter((l) => l !== level)
        : [...prev.target_job_levels, level],
    }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-8 w-8" />
              Targeting
            </h1>
            <p className="text-muted-foreground">
              Define your ideal customer profile for AI-powered prospect discovery
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">{error}</div>}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">{success}</div>
        )}

        {/* Location & Customer Type */}
        <Card>
          <CardHeader>
            <CardTitle>Market Focus</CardTitle>
            <CardDescription>Define where and who you want to target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Target Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., United States, California, New York"
                  value={targeting.target_location}
                  onChange={(e) => setTargeting((prev) => ({ ...prev, target_location: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Geographic area(s) to focus your outreach</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerType">Customer Type</Label>
                <Select
                  value={targeting.target_customer_type}
                  onValueChange={(value) => setTargeting((prev) => ({ ...prev, target_customer_type: value }))}
                >
                  <SelectTrigger id="customerType">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Type of customers you serve</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industries */}
        <Card>
          <CardHeader>
            <CardTitle>Target Industries</CardTitle>
            <CardDescription>Industries you want to target (comma-separated)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="e.g., Technology, Healthcare, Finance, Real Estate"
                value={industriesInput}
                onChange={(e) => setIndustriesInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter industries separated by commas. The AI will search for prospects in these sectors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Size */}
        <Card>
          <CardHeader>
            <CardTitle>Company Size</CardTitle>
            <CardDescription>Select the company sizes you want to target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COMPANY_SIZE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    targeting.target_company_sizes.includes(option.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                  onClick={() => toggleCompanySize(option.value)}
                >
                  <Checkbox
                    id={`size-${option.value}`}
                    checked={targeting.target_company_sizes.includes(option.value)}
                    onCheckedChange={() => toggleCompanySize(option.value)}
                  />
                  <Label htmlFor={`size-${option.value}`} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Decision Maker Levels</CardTitle>
            <CardDescription>Select the seniority levels you want to reach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {JOB_LEVEL_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    targeting.target_job_levels.includes(option.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                  onClick={() => toggleJobLevel(option.value)}
                >
                  <Checkbox
                    id={`level-${option.value}`}
                    checked={targeting.target_job_levels.includes(option.value)}
                    onCheckedChange={() => toggleJobLevel(option.value)}
                  />
                  <Label htmlFor={`level-${option.value}`} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Titles */}
        <Card>
          <CardHeader>
            <CardTitle>Specific Job Titles</CardTitle>
            <CardDescription>Target specific job titles (comma-separated)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="e.g., CEO, Marketing Director, VP of Sales, Head of Growth"
                value={jobTitlesInput}
                onChange={(e) => setJobTitlesInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter specific job titles separated by commas. Leave empty to use job levels above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
