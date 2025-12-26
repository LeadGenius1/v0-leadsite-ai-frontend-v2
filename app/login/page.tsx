"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leadsite.ai"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password")
        }
        const data = await response.json().catch(() => ({ message: "Login failed" }))
        throw new Error(data.message || data.error || "Login failed")
      }

      const data = await response.json()

      if (data.token) {
        localStorage.setItem("leadsite_token", data.token)
      } else {
        throw new Error("No token received from server")
      }

      if (data.user?.id) {
        localStorage.setItem("userId", data.user.id.toString())
      }

      setIsLoading(false)
      setIsRedirecting(true)

      try {
        const token = localStorage.getItem("leadsite_token")
        const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (profileResponse.status === 401) {
          localStorage.removeItem("leadsite_token")
          localStorage.removeItem("userId")
          router.push("/login")
          return
        }

        const profileData = await profileResponse.json()

        if (profileData.success === true && profileData.profile !== null) {
          window.location.href = "/dashboard"
        } else {
          window.location.href = "/onboarding"
        }
      } catch (profileError) {
        window.location.href = "/onboarding"
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Cannot connect to the server. Please try again later.")
      } else {
        setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
      }
      setIsLoading(false)
      setIsRedirecting(false)
    }
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          <span className="text-2xl font-bold text-white">LeadSite.AI</span>
        </div>
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-white">Checking your account...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
            <span className="text-2xl font-bold text-white">LeadSite.AI</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-400">Access your lead generation dashboard</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-indigo-500 hover:text-indigo-400">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-400">Don't have an account? </span>
              <Link href="/signup" className="font-medium text-indigo-500 hover:text-indigo-400">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
