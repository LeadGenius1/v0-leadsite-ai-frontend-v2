import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, company_name, website_url } = body

    console.log("[v0] Signup API received:", { email, company_name, has_password: !!password, website_url })

    if (!email || !password || !company_name) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-2987.up.railway.app"
    const response = await fetch(`${backendUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        company_name,
        website_url: website_url || "", // Default to empty string if not provided
      }),
    })

    const data = await response.json()

    console.log("[v0] Backend signup response:", { status: response.status, success: data.success })

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Signup API error:", error)
    return NextResponse.json({ success: false, message: "Server error during signup" }, { status: 500 })
  }
}
