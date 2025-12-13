import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, company_name, website_url } = body

    // Validate required fields
    if (!email || !password || !company_name || !website_url) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Forward to backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, company_name, website_url }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Signup API error:", error)
    return NextResponse.json({ success: false, message: "Server error during signup" }, { status: 500 })
  }
}
