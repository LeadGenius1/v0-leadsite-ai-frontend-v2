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
import { apiGet, apiPost } from "@/lib/api"

const COMPANY_SIZE_OPTIONS = [
  { value: "0-10", label: "0–10 employees" },
  { value: "10-50", label: "10–50 employees" },
  { value: "50-200", label: "50–200 employees" },
  { value: "200-1000", label: "200–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
]

const JOB_LEVEL_OPTIONS = [
  { value: "Owner", label: "Owner" },
  { value: "C-Level", label: "C-Level" },
  { value: "VP-Level", label: "VP-Level" },
  { value: "Director-Level", label: "Director-Level" },
  { value: "Manager-Level", label: "Manager-Level" },
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

interface ProfileResponse {
  success: boolean
  profile: {
    business_name?: string
    industry?: string
    website?: string
    owner_name?: string
    email?: string
    phone?: string
    description?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    services?: string
    unique_selling_points?: string
    target_location?: string
    target_customer_type?: string
    target_industries?: string[] | string
    target_company_sizes?: string[] | string
    target_job_titles?: string[] | string
    target_job_levels?: string[] | string
  } | null
}

export default function TargetingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [fullProfile, setFullProfile] = useState<ProfileResponse["profile"]>(null)

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
        const data = await apiGet<ProfileResponse>("/api/profile")

        if (data.profile) {
          setFullProfile(data.profile)

          const parseArray = (val: string[] | string | undefined): string[] => {
            if (!val) return []
            if (Array.isArray(val)) return val
            if (typeof val === "string") {
              return val
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            }
            return []
          }

          const targetingData: TargetingData = {
            target_industries: parseArray(data.profile.target_industries),
            target_company_sizes: parseArray(data.profile.target_company_sizes),
            target_job_titles: parseArray(data.profile.target_job_titles),
            target_job_levels: parseArray(data.profile.target_job_levels),
            target_location: data.profile.target_location || "",
            target_customer_type: data.profile.target_customer_type || "",
          }

          setTargeting(targetingData)
          setIndustriesInput(targetingData.target_industries.join(", "))
          setJobTitlesInput(targetingData.target_job_titles.join(", "))
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "NO_TOKEN" || err.message === "UNAUTHORIZED") {
            window.location.href = "/login"
            return
          }
          setError(err.message)
        } else {
          setError("Failed to load targeting data")
        }
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
      // Parse comma-separated inputs into arrays
      const updatedTargeting = {
        target_industries: industriesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        target_job_titles: jobTitlesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        target_company_sizes: targeting.target_company_sizes,
        target_job_levels: targeting.target_job_levels,
        target_location: targeting.target_location,
        target_customer_type: targeting.target_customer_type,
      }

      const payload = {
        ...fullProfile,
        ...updatedTargeting,
      }

      await apiPost("/api/profile", payload)

      setSuccess("Targeting preferences saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "NO_TOKEN" || err.message === "UNAUTHORIZED") {
          window.location.href = "/login"
          return
        }
        setError(err.message)
      } else {
        setError("Failed to save targeting")
      }
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
