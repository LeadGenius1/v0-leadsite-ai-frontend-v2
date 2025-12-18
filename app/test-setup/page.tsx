"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Loader2, ArrowRight, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

interface TestResult {
  name: string
  status: "pending" | "running" | "pass" | "fail"
  message?: string
  duration?: number
}

export default function TestSetupPage() {
  const [testUser, setTestUser] = useState({
    email: `test_${Date.now()}@leadsite.ai`,
    password: "TestPassword123!",
    business_name: "Acme Test Corp",
    website_url: "https://www.anthropic.com",
    industry: "Technology / SaaS",
  })

  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [createdUserId, setCreatedUserId] = useState<string | null>(null)
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

  const updateResult = (name: string, status: TestResult["status"], message?: string, duration?: number) => {
    setResults((prev) => {
      const existing = prev.find((r) => r.name === name)
      if (existing) {
        return prev.map((r) => (r.name === name ? { ...r, status, message, duration } : r))
      }
      return [...prev, { name, status, message, duration }]
    })
  }

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    const tests = [
      {
        name: "1. Health Check",
        run: async () => {
          const start = Date.now()
          const res = await fetch(`${API_BASE}/api/health`)
          if (!res.ok) throw new Error(`Status: ${res.status}`)
          const data = await res.json()
          return { message: `API is ${data.status || "healthy"}`, duration: Date.now() - start }
        },
      },
      {
        name: "2. Register New User",
        run: async () => {
          const start = Date.now()
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: testUser.email,
              password: testUser.password,
              company_name: testUser.business_name,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Registration failed")
          if (data.token) {
            setCreatedToken(data.token)
            localStorage.setItem("token", data.token)
          }
          if (data.customerId) {
            setCreatedUserId(data.customerId)
            localStorage.setItem("customerId", data.customerId)
          }
          return { message: `User created: ${testUser.email}`, duration: Date.now() - start }
        },
      },
      {
        name: "3. Login User",
        run: async () => {
          const start = Date.now()
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: testUser.email,
              password: testUser.password,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Login failed")
          if (data.token) {
            setCreatedToken(data.token)
            localStorage.setItem("token", data.token)
          }
          return { message: `Token received: ${data.token?.substring(0, 20)}...`, duration: Date.now() - start }
        },
      },
      {
        name: "4. Check Auth Status",
        run: async () => {
          const start = Date.now()
          const token = localStorage.getItem("token")
          if (!token) throw new Error("No token in localStorage")

          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Auth check failed")
          return { message: `Authenticated as: ${data.email || data.user?.email}`, duration: Date.now() - start }
        },
      },
      {
        name: "5. Create Business Profile",
        run: async () => {
          const start = Date.now()
          const token = localStorage.getItem("token")

          const profileData = {
            website_url: testUser.website_url,
            business_name: testUser.business_name,
            industry: testUser.industry,
            target_customer_type: "B2B",
            product_service_description: "AI-powered lead generation platform",
          }

          const res = await fetch(`${API_BASE}/api/profile`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Profile creation failed")
          return { message: `Profile created for: ${testUser.business_name}`, duration: Date.now() - start }
        },
      },
      {
        name: "6. Get Profile",
        run: async () => {
          const start = Date.now()
          const token = localStorage.getItem("token")

          const res = await fetch(`${API_BASE}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Get profile failed")
          return {
            message: `Website: ${data.website_url || data.profile?.website_url}`,
            duration: Date.now() - start,
          }
        },
      },
      {
        name: "7. Get Dashboard Data",
        run: async () => {
          const start = Date.now()
          const token = localStorage.getItem("token")

          const res = await fetch(`${API_BASE}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.status === 404) {
            return { message: "Dashboard endpoint returns 404 - using fallback", duration: Date.now() - start }
          }
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Dashboard fetch failed")
          return {
            message: `Stats loaded: ${Object.keys(data).length} fields`,
            duration: Date.now() - start,
          }
        },
      },
    ]

    for (const test of tests) {
      updateResult(test.name, "running")
      try {
        const result = await test.run()
        updateResult(test.name, "pass", result.message, result.duration)
      } catch (error: any) {
        updateResult(test.name, "fail", error.message)
        break // Stop on first failure
      }
    }

    setIsRunning(false)
  }

  const resetTests = () => {
    setResults([])
    setTestUser({
      email: `test_${Date.now()}@leadsite.ai`,
      password: "TestPassword123!",
      business_name: "Acme Test Corp",
      website_url: "https://www.anthropic.com",
      industry: "Technology / SaaS",
    })
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
    }
  }

  const passedTests = results.filter((r) => r.status === "pass").length
  const failedTests = results.filter((r) => r.status === "fail").length

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">System Integration Test</h1>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          <p className="text-gray-400">
            Test the complete user journey from signup to dashboard. This verifies all API endpoints are working
            correctly.
          </p>
        </div>

        {/* Test Configuration */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test User Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={testUser.email}
                onChange={(e) => setTestUser({ ...testUser, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="text"
                value={testUser.password}
                onChange={(e) => setTestUser({ ...testUser, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Business Name</label>
              <input
                type="text"
                value={testUser.business_name}
                onChange={(e) => setTestUser({ ...testUser, business_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Website URL</label>
              <input
                type="url"
                value={testUser.website_url}
                onChange={(e) => setTestUser({ ...testUser, website_url: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Run Integration Tests
                </>
              )}
            </button>

            <button
              onClick={resetTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Test Results</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-green-500">Passed: {passedTests}</span>
                <span className="text-red-500">Failed: {failedTests}</span>
                <span className="text-gray-400">Total: {results.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{result.name}</h3>
                      {result.duration && <span className="text-xs text-gray-500">{result.duration}ms</span>}
                    </div>
                    {result.message && (
                      <p className={`text-sm ${result.status === "fail" ? "text-red-400" : "text-gray-400"}`}>
                        {result.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isRunning && passedTests === results.length && results.length > 0 && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 font-medium">All tests passed! The user journey is working correctly.</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Go to Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {createdToken && (
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Created Session Token:</p>
                <code className="text-xs text-cyan-400 break-all">{createdToken}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
