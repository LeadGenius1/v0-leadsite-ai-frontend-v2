"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-2987.up.railway.app"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Step 1: Read leadsite_token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("leadsite_token") : null

      // No token -> redirect to login
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // Step 2: Call GET /api/profile with Authorization header
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        // 401 -> clear token and redirect to login
        if (response.status === 401) {
          localStorage.removeItem("leadsite_token")
          localStorage.removeItem("userId")
          router.push("/login")
          return
        }

        const data = await response.json()

        // Step 3: Check profile existence
        if (data.success === true && data.profile === null) {
          // No profile -> redirect to onboarding
          router.push("/onboarding")
          return
        }

        if (data.exists === false) {
          // Profile doesn't exist -> redirect to onboarding
          router.push("/onboarding")
          return
        }

        // Profile exists -> allow dashboard access
        setIsAuthorized(true)
      } catch (err) {
        // On error, redirect to login
        localStorage.removeItem("leadsite_token")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render children (redirect will happen)
  if (!isAuthorized) {
    return null
  }

  // Authorized -> render dashboard content
  return <>{children}</>
}
